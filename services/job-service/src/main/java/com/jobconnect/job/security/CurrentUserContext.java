package com.jobconnect.job.security;

/**
 * Per-request holder for the identity api-gateway's JwtAuthenticationFilter attaches as
 * trusted X-User-Id / X-User-Role headers after validating the caller's JWT. Populated by
 * {@link CurrentUserFilter} at the start of every request and always cleared at the end
 * (including on exceptions), so it can never leak between requests on a pooled thread.
 *
 * Deliberately a plain ThreadLocal rather than Spring Security's SecurityContextHolder:
 * job-service has no Spring Security dependency, and doesn't need one just to read two
 * already-gateway-validated headers -- adding the full framework here would be dead weight.
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

    /** The authenticated caller's user id, or null if the request carried no valid identity. */
    public static Long getUserId() {
        return USER_ID.get();
    }

    /** The authenticated caller's role (e.g. "RECRUITER"), or null if unauthenticated. */
    public static String getRole() {
        return ROLE.get();
    }
}
