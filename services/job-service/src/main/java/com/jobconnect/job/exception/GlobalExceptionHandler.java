package com.jobconnect.job.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.jobconnect.job.security.ForbiddenException;
import com.jobconnect.job.security.UnauthorizedException;

/**
 * Only handles the new RBAC exceptions -- every other exception type in this service kept its
 * pre-existing (unhandled, default-Spring-Boot-error-page) behavior, which was out of scope for
 * this change and shouldn't shift unrelated endpoints' error responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, String>> handleUnauthorized(UnauthorizedException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("msg", e.getMessage()));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, String>> handleForbidden(ForbiddenException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("msg", e.getMessage()));
    }
}
