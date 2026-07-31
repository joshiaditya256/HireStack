package com.jobconnect.apis.filter;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpCookie;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import com.jobconnect.apis.config.*;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter implements WebFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    private final SecurityProperties securityProperties;

    public JwtAuthenticationFilter(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
    }

    // BUGFIX / security hardening: previously this filter validated the JWT purely to
    // populate Spring Security's reactive SecurityContext for the gateway's own
    // authorizeExchange() rule -- it never forwarded the authenticated identity to the
    // downstream services. job-service/feed-service separately trusted a client-suppliable
    // "X-User-Id" header (with a hardcoded fallback to user id 1 if absent), which meant a
    // caller could set that header to whatever they wanted, gateway JWT check notwithstanding.
    // This filter now (a) always strips any inbound X-User-Id/X-User-Email/X-User-Role headers
    // so a client can never inject them directly, and (b) if the JWT is valid, re-adds them
    // derived from the token's own claims -- so downstream services now receive an
    // identity header that is actually gateway-enforced instead of client-asserted.
    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_USER_EMAIL = "X-User-Email";
    private static final String HEADER_USER_ROLE = "X-User-Role";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        log.info("Incoming request to path: {}", path);

        // ALWAYS allow OPTIONS requests through so CORS preflight can succeed
        if (request.getMethod() == org.springframework.http.HttpMethod.OPTIONS) {
            log.info("OPTIONS preflight request bypassed: {}", path);
            return chain.filter(exchange);
        }

        if (isPublicPath(path)) {
            log.info("Public path accessed, bypassing auth: {}", path);
            return chain.filter(stripIdentityHeaders(exchange));
        }

        log.info("Request cookies: {}", request.getCookies());
        String token = extractTokenFromCookie(request);
        log.info("Extracted token: {}", token != null ? "Token present" : "Token is null");
        if (token == null) {
            log.warn("No JWT token found in request to: {}", path);
            return chain.filter(stripIdentityHeaders(exchange));
        }

        try {
            Claims claims = validateToken(token);
            if (claims != null) {
                log.info("Token validation successful. Claims: {}", claims);
                String email = claims.get("email", String.class);
                Object userIdClaim = claims.get("userId");
                String userId = userIdClaim != null ? String.valueOf(userIdClaim) : null;
                // Read role from claims if available, otherwise default to ROLE_USER
                String role = claims.get("role", String.class);
                if (role == null)
                    role = "ROLE_USER";

                log.info("Authenticated user: email={}, role={}", email, role);

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority(role)) // ✅ Fixed
                );

                ServerWebExchange mutatedExchange = withIdentityHeaders(exchange, userId, email, role);

                return chain.filter(mutatedExchange)
                        .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication));
            }
        } catch (Exception e) {
            log.error("JWT validation failed for path {}: {}", path, e.getMessage(), e);
        }

        // FAIL CLOSED: a token was present (this branch is only reachable when extractTokenFromCookie
        // returned non-null above) but failed to validate -- bad signature, expired, or malformed.
        // Previously this fell through and let the request continue with no authenticated context,
        // relying entirely on .anyExchange().authenticated() further down the chain to reject it --
        // meaning an invalid token was silently indistinguishable from no token at all. That's a
        // latent risk (see PROJECT_DOCUMENTATION.md Known Issues): if a route were ever
        // misconfigured as public, an invalid token would pass through unnoticed instead of being
        // rejected. Reject immediately and explicitly instead. This only fires for non-public paths
        // (isPublicPath() already returned above for public routes), so a stale/garbage authToken
        // cookie can never break signup/login/etc.
        log.warn("Invalid or expired token presented for protected path: {}, rejecting", path);
        exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    /** Removes any client-supplied identity headers so they can never be spoofed. */
    private ServerWebExchange stripIdentityHeaders(ServerWebExchange exchange) {
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .headers(headers -> {
                    headers.remove(HEADER_USER_ID);
                    headers.remove(HEADER_USER_EMAIL);
                    headers.remove(HEADER_USER_ROLE);
                })
                .build();
        return exchange.mutate().request(mutatedRequest).build();
    }

    /** Strips any client-supplied identity headers, then re-adds them from validated JWT claims. */
    private ServerWebExchange withIdentityHeaders(ServerWebExchange exchange, String userId, String email,
            String role) {
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .headers(headers -> {
                    headers.remove(HEADER_USER_ID);
                    headers.remove(HEADER_USER_EMAIL);
                    headers.remove(HEADER_USER_ROLE);
                    if (userId != null) {
                        headers.set(HEADER_USER_ID, userId);
                    }
                    if (email != null) {
                        headers.set(HEADER_USER_EMAIL, email);
                    }
                    headers.set(HEADER_USER_ROLE, role);
                })
                .build();
        return exchange.mutate().request(mutatedRequest).build();
    }

    private boolean isPublicPath(String path) {
        return securityProperties.getPublicPaths()
                .stream()
                .anyMatch(path::startsWith);
    }

    private String extractTokenFromCookie(ServerHttpRequest request) {
        HttpCookie cookie = request.getCookies().getFirst("authToken");
        return cookie != null ? cookie.getValue() : null;
    }

    private Claims validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            return Jwts.parserBuilder() // ✅ Fixed: use parserBuilder()
                    .setSigningKey(key)
                    .build() // ✅ Fixed: must call build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            log.error("Failed to parse JWT: {}", e.getMessage());
            return null;
        }
    }
}