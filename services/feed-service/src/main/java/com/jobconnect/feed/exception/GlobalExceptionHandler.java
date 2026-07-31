package com.jobconnect.feed.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.jobconnect.feed.dtos.ApiResponse;
import com.jobconnect.feed.security.ForbiddenException;
import com.jobconnect.feed.security.UnauthorizedException;

/**
 * Only handles the new identity exceptions -- every other exception type in this service kept
 * its pre-existing (unhandled, default-Spring-Boot-error-page) behavior, which was out of
 * scope for this change. Uses the same {@code ApiResponse} envelope every other endpoint in
 * this service already returns, rather than introducing a different error shape.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(e.getMessage()));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbidden(ForbiddenException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage()));
    }
}
