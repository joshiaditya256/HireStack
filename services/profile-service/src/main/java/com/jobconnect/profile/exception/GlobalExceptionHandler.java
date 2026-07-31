package com.jobconnect.profile.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.jobconnect.profile.security.ForbiddenException;
import com.jobconnect.profile.security.UnauthorizedException;

/**
 * Only handles the new RBAC exceptions -- ProfileNotFoundException/ProfileAlreadyExistsException
 * kept their pre-existing handling (inline @ExceptionHandler methods on ProfileController),
 * which was out of scope for this change.
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
