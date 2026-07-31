package com.jobconnect.feed.security;

/**
 * Turns "who is calling" into an allow/deny decision for feed-service. Unlike job-service,
 * feed actions (post/like/comment) aren't role-gated -- any authenticated user of any role may
 * do all of them -- so this only needs an identity check, not a role check. See job-service's
 * AccessGuard for the fuller pattern (role + ownership) used where roles actually matter.
 */
public final class AccessGuard {

    private AccessGuard() {
    }

    /** Returns the caller's user id, or throws 401 if the request carries no valid identity. */
    public static Long requireUserId() {
        Long userId = CurrentUserContext.getUserId();
        if (userId == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return userId;
    }

    /** Throws 403 unless the caller authored the post (ownerId) or is an admin. Used by post deletion. */
    public static void requireOwnerOrAdmin(Long ownerId) {
        Long userId = requireUserId();
        if (userId.equals(ownerId)) {
            return;
        }
        if ("ADMIN".equals(CurrentUserContext.getRole())) {
            return;
        }
        throw new ForbiddenException("You can only delete your own posts");
    }
}
