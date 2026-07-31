package com.jobconnect.profile.security;

/**
 * Per-request holder for the identity api-gateway's JwtAuthenticationFilter attaches as
 * trusted X-User-Id / X-User-Role headers after validating the caller's JWT. Populated by
 * {@link CurrentUserFilter} at the start of every request and always cleared at the end.
 *
 * BUGFIX: profile-service used to lean on Spring Security's SecurityContextHolder for this
 * (see the old FeedbackController), but nothing in this service was an actual Spring Security
 * resource server -- no filter ever authenticated a request and populated that context, so
 * every read of it was always anonymous/null at runtime (see PROJECT_DOCUMENTATION.md Known
 * Issues). This ThreadLocal-based holder (mirroring job-service/feed-service's identical
 * class) replaces that dead pattern with one that's actually populated.
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
