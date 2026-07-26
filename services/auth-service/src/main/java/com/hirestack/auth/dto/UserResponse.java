package com.hirestack.auth.dto;

import java.time.LocalDateTime;

public record UserResponse(
        String id,
        String name,
        String email,
        String role,
        boolean isVerified,
        LocalDateTime createdAt) {
}
