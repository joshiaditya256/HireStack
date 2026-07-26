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
            return chain.filter(exchange);
        }

        log.info("Request cookies: {}", request.getCookies());
        String token = extractTokenFromCookie(request);
        log.info("Extracted token: {}", token != null ? "Token present" : "Token is null");
        if (token == null) {
            log.warn("No JWT token found in request to: {}", path);
            return chain.filter(exchange);
        }

        try {
            Claims claims = validateToken(token);
            if (claims != null) {
                log.info("Token validation successful. Claims: {}", claims);
                String email = claims.get("email", String.class);
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

                return chain.filter(exchange)
                        .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication));
            } else {
                log.warn("Token validation returned null claims for path: {}", path);
            }
        } catch (Exception e) {
            log.error("JWT validation failed for path {}: {}", path, e.getMessage(), e);
        }

        log.warn("Authentication failed for path: {}, proceeding without auth context", path);
        return chain.filter(exchange);
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