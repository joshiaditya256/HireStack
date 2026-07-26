package com.hirestack.auth.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final boolean clearAuthCookie;

    public ApiException(HttpStatus status, String message) {
        this(status, message, false);
    }

    public ApiException(HttpStatus status, String message, boolean clearAuthCookie) {
        super(message);
        this.status = status;
        this.clearAuthCookie = clearAuthCookie;
    }
}
