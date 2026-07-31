package com.jobconnect.feed.security;

/**
 * Per-request holder for the identity api-gateway's JwtAuthenticationFilter attaches as
 * trusted X-User-Id / X-User-Role headers after validating the caller's JWT. Populated by
 * {@link CurrentUserFilter} at the start of every request and always cleared at the end
 * (including on exceptions), so it can never leak between requests on a pooled thread.
 * Mirrors job-service's identical class -- see that service's version for the full rationale;
 * each Spring Boot service here maps its own copy of shared concerns rather than depending on
 * a shared library (the established pattern across this codebase, see
 * PROJECT_DOCUMENTATION.md §41).
 */
public final class CurrentUserContext {

    private static final ThreadLocal<Long> USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> ROLE = new ThreadLocal<>();

    private CurrentUserContext() {
    }

    static void set(Long userId, String role) {
        USER_ID.set(userId);
        ROLE.set(role);
    }

    static void clear() {
        USER_ID.remove();
        ROLE.remove();
    }

    public static Long getUserId() {
        return USER_ID.get();
    }

    public static String getRole() {
        return ROLE.get();
    }
}
