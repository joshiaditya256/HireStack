package com.hirestack.auth.dto;

import java.time.LocalDateTime;

public record ProfileResponse(
        String id,
        String userId,
        String headline,
        String bio,
        String skills,
        String experience,
        String education,
        String location,
        String avatarUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
