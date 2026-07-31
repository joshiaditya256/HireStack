package com.jobconnect.feed.security;

/** No valid gateway-forwarded identity on the request. Mapped to 401 by GlobalExceptionHandler. */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
