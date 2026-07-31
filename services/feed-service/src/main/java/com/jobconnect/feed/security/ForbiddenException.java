package com.jobconnect.feed.security;

/** Caller is identified but not allowed to perform this action. Mapped to 403 by GlobalExceptionHandler. */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
