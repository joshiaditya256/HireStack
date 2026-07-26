package com.hirestack.auth.dto;

import java.time.LocalDateTime;

public record UserSummaryResponse(
        String id,
        String name,
        String email,
        String role,
        LocalDateTime createdAt) {
}
