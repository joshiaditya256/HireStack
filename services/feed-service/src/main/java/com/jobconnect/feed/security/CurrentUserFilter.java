package com.jobconnect.feed.security;

import java.io.IOException;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;

/** See job-service's identical class for the full rationale. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CurrentUserFilter implements jakarta.servlet.Filter {

    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_USER_ROLE = "X-User-Role";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        try {
            Long userId = parseUserId(httpRequest.getHeader(HEADER_USER_ID));
            String role = normalizeRole(httpRequest.getHeader(HEADER_USER_ROLE));
            CurrentUserContext.set(userId, role);
            chain.doFilter(request, response);
        } finally {
            CurrentUserContext.clear();
        }
    }

    private Long parseUserId(String header) {
        if (header == null || header.isBlank()) {
            return null;
        }
        try {
            return Long.valueOf(header);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String normalizeRole(String header) {
        if (header == null || header.isBlank()) {
            return null;
        }
        return header.startsWith("ROLE_") ? header.substring(5) : header;
    }
}
