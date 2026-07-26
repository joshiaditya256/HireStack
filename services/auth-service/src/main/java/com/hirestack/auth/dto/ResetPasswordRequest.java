package com.hirestack.auth.dto;

public record ResetPasswordRequest(String token, String newPassword) {
}
