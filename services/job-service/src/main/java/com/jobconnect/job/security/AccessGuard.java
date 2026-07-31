package com.jobconnect.job.security;

import com.jobconnect.job.entities.Role;

/**
 * Single place that turns "who is calling, with what role" into an allow/deny decision, so
 * controllers express authorization as one line (`AccessGuard.requireRole(...)`) instead of
 * repeating `if (role == null || !role.equals(...)) return ResponseEntity.status(403)...`
 * inline in every handler. Backed by {@link CurrentUserContext}, which is populated per-request
 * by {@link CurrentUserFilter} from the gateway's trusted identity headers.
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

    /** Throws 403 unless the caller's role is one of the given allowed roles. */
    public static void requireRole(Role... allowed) {
        String role = CurrentUserContext.getRole();
        if (role == null) {
            throw new UnauthorizedException("Authentication required");
        }
        for (Role candidate : allowed) {
            if (candidate.name().equals(role)) {
                return;
            }
        }
        throw new ForbiddenException("This action requires one of: " + java.util.Arrays.toString(allowed));
    }

    /** Throws 403 unless the caller owns the resource (ownerId) or holds one of the given override roles. */
    public static void requireOwnerOrRole(Long ownerId, Role... overrideRoles) {
        Long userId = requireUserId();
        if (userId.equals(ownerId)) {
            return;
        }
        String role = CurrentUserContext.getRole();
        for (Role candidate : overrideRoles) {
            if (candidate.name().equals(role)) {
                return;
            }
        }
        throw new ForbiddenException("You do not own this resource");
    }
}
