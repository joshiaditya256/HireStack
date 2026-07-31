package com.jobconnect.apis.filter;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;

import reactor.core.publisher.Mono;

/**
 * Fires a best-effort, fire-and-forget activity log entry at the .NET logger-service
 * (see services/logger-service) for every request the gateway routes, so there is one
 * place that sees every hop across all 4 downstream services. This is what the resume's
 * ".NET logger service for centralized activity logging across services" line refers to,
 * and what the previously-unused "logs" table in infra/docker/mysql/init.sql was always
 * meant to back (before this filter existed, nothing in the codebase ever wrote to it).
 *
 * This is intentionally designed to never affect the real request/response:
 *  - the POST to logger-service is subscribed to independently, after the real response
 *    has already completed (see the doOnEach/doFinally hook below), and
 *  - any failure -- including logger-service simply not being up -- is swallowed via
 *    onErrorResume so a logging outage can never turn into a gateway outage.
 */
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class ActivityLoggingFilter implements WebFilter {

    private static final Logger log = LoggerFactory.getLogger(ActivityLoggingFilter.class);

    @Value("${logger.service.url:http://localhost:5090/api/logs}")
    private String loggerServiceUrl;

    @Value("${logger.service.enabled:true}")
    private boolean loggerServiceEnabled;

    private final WebClient webClient = WebClient.builder().build();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        if (!loggerServiceEnabled) {
            return chain.filter(exchange);
        }

        long startNanos = System.nanoTime();
        ServerHttpRequest request = exchange.getRequest();

        return chain.filter(exchange)
                .doFinally(signalType -> recordActivity(exchange, request, startNanos));
    }

    private void recordActivity(ServerWebExchange exchange, ServerHttpRequest request, long startNanos) {
        try {
            long durationMs = Duration.ofNanos(System.nanoTime() - startNanos).toMillis();
            String path = request.getURI().getPath();
            String serviceName = resolveServiceName(path);
            int statusCode = exchange.getResponse().getStatusCode() != null
                    ? exchange.getResponse().getStatusCode().value()
                    : 0;

            Long userId = null;
            String userIdHeader = request.getHeaders().getFirst("X-User-Id");
            if (userIdHeader != null) {
                try {
                    userId = Long.parseLong(userIdHeader);
                } catch (NumberFormatException ignored) {
                    // best-effort only -- never fail the request over a malformed header
                }
            }

            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId); // HashMap allows null values, unlike Map.of(...)
            body.put("service", serviceName);
            body.put("endpoint", path);
            body.put("method", request.getMethod() != null ? request.getMethod().name() : "UNKNOWN");
            body.put("statusCode", statusCode);
            body.put("durationMs", (int) durationMs);

            webClient.post()
                    .uri(loggerServiceUrl)
                    .bodyValue(body)
                    .retrieve()
                    .toBodilessEntity()
                    .doOnError(e -> log.debug("Activity logging call to logger-service failed: {}", e.getMessage()))
                    .onErrorResume(e -> Mono.empty())
                    .subscribe();
        } catch (Exception e) {
            // Logging must never be able to break or slow down a real request.
            log.debug("Skipped activity logging due to unexpected error: {}", e.getMessage());
        }
    }

    private String resolveServiceName(String path) {
        if (path.startsWith("/api/auth")) {
            return "auth-service";
        }
        if (path.startsWith("/api/profile")) {
            return "profile-service";
        }
        if (path.startsWith("/api/jobs") || path.startsWith("/api/companies") || path.startsWith("/api/applications")) {
            return "job-service";
        }
        if (path.startsWith("/api/feed")) {
            return "feed-service";
        }
        return "api-gateway";
    }
}
