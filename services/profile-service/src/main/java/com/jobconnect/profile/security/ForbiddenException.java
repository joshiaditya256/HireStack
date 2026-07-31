package com.jobconnect.profile.security;

/** Caller is identified but not allowed to perform this action. Mapped to 403 by a controller-level handler. */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
