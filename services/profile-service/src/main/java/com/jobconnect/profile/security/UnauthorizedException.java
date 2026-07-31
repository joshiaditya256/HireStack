package com.jobconnect.profile.security;

/** No valid gateway-forwarded identity on the request. Mapped to 401 by a controller-level handler. */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
