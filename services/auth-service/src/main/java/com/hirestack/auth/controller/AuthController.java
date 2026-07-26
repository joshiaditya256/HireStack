package com.hirestack.auth.controller;

import com.hirestack.auth.dto.EmailRequest;
import com.hirestack.auth.dto.LoginRequest;
import com.hirestack.auth.dto.ResetPasswordRequest;
import com.hirestack.auth.dto.SignupRequest;
import com.hirestack.auth.dto.VerifyOtpRequest;
import com.hirestack.auth.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final long AUTH_COOKIE_MAX_AGE_MS = 2_592_000_000L; // 30 days

    private final AuthService authService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        if (isBlank(request.name()) || isBlank(request.email()) || isBlank(request.password())) {
            return ResponseEntity.badRequest().body(Map.of("msg", "Name, email, and password required"));
        }
        AuthService.ServiceResult result = authService.signup(request);
        return ResponseEntity.status(result.status()).body(result.body());
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody EmailRequest request) {
        if (isBlank(request.email())) {
            return ResponseEntity.badRequest().body(Map.of("msg", "Email is required"));
        }
        authService.resendOtp(request.email());
        return ResponseEntity.ok(Map.of("msg", "OTP resent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request, HttpServletResponse response) {
        if (isBlank(request.email()) || isBlank(request.otp())) {
            return ResponseEntity.badRequest().body(Map.of("msg", "Email and OTP required"));
        }
        AuthService.VerifyResult result = authService.verifyOtp(request.email(), request.otp());
        setAuthCookie(response, result.token());
        return ResponseEntity.ok(Map.of("msg", "Email verified successfully", "user", result.user()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        if (isBlank(request.email()) || isBlank(request.password())) {
            return ResponseEntity.badRequest().body(Map.of("msg", "Email and password required"));
        }
        AuthService.LoginResult result = authService.login(request.email(), request.password());
        setAuthCookie(response, result.token());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("msg", "User logged in successfully");
        body.put("userProfile", result.profile());
        body.put("user", result.user());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/current-user")
    public ResponseEntity<?> currentUser(@CookieValue(value = "authToken", required = false) String token) {
        AuthService.CurrentUserResult result = authService.getCurrentUser(token);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("user", result.user());
        body.put("userProfile", result.profile());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getById(id));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        clearAuthCookie(response);
        return ResponseEntity.ok(Map.of("msg", "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody EmailRequest request) {
        authService.forgotPassword(request.email(), frontendUrl);
        return ResponseEntity.ok(Map.of("msg", "Reset link sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(Map.of("msg", "Password reset successful"));
    }

    private boolean isBlank(String value) {
        return !StringUtils.hasText(value);
    }

    private void setAuthCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("authToken", token)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofMillis(AUTH_COOKIE_MAX_AGE_MS))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearAuthCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("authToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
