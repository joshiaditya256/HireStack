package com.jobconnect.profile.security;

/**
 * Turns "who is calling" into an allow/deny decision for profile-service, so controllers
 * express authorization as one line instead of repeating inline checks. No local Role enum
 * exists in this service (profile-service's User.role is a plain String -- see that entity),
 * so role comparisons here are plain string equality against the same "ADMIN"/"RECRUITER"/
 * "CANDIDATE" values every other service's Role enum also uses.
 */
public final class AccessGuard {

    public static final String ROLE_ADMIN = "ADMIN";

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

    /** Throws 403 unless the caller owns the resource (ownerId) or is an admin. */
    public static void requireOwnerOrAdmin(Long ownerId) {
        Long userId = requireUserId();
        if (userId.equals(ownerId)) {
            return;
        }
        if (ROLE_ADMIN.equals(CurrentUserContext.getRole())) {
            return;
        }
        throw new ForbiddenException("You do not own this resource");
    }

    /** Throws 403 unless the caller is an admin. */
    public static void requireAdmin() {
        requireUserId();
        if (!ROLE_ADMIN.equals(CurrentUserContext.getRole())) {
            throw new ForbiddenException("Admin access required");
        }
    }
}
