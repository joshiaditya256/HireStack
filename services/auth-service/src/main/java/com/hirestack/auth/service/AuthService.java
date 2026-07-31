package com.hirestack.auth.service;

import static com.hirestack.auth.mapper.UserMapper.toProfileResponse;
import static com.hirestack.auth.mapper.UserMapper.toUserResponse;
import static com.hirestack.auth.mapper.UserMapper.toUserSummaryResponse;

import com.hirestack.auth.dto.ProfileResponse;
import com.hirestack.auth.dto.SignupRequest;
import com.hirestack.auth.dto.UserResponse;
import com.hirestack.auth.dto.UserSummaryResponse;
import com.hirestack.auth.entity.Profile;
import com.hirestack.auth.entity.Role;
import com.hirestack.auth.entity.User;
import com.hirestack.auth.exception.ApiException;
import com.hirestack.auth.repository.ProfileRepository;
import com.hirestack.auth.repository.UserRepository;
import com.hirestack.auth.security.JwtUtil;
import io.jsonwebtoken.Claims;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_OTP_ATTEMPTS = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MailService mailService;

    public record ServiceResult(HttpStatus status, Object body) {
    }

    public record VerifyResult(String token, UserResponse user) {
    }

    public record LoginResult(String token, ProfileResponse profile, UserResponse user) {
    }

    public record CurrentUserResult(UserResponse user, ProfileResponse profile) {
    }

    @Transactional
    public ServiceResult signup(SignupRequest request) {
        var existing = userRepository.findByEmail(request.email());
        if (existing.isPresent()) {
            User user = existing.get();
            if (user.isVerified()) {
                throw new ApiException(HttpStatus.CONFLICT, "User already exists");
            }
            issueAndSendOtp(user);
            return new ServiceResult(HttpStatus.OK,
                    java.util.Map.of("msg", "OTP resent successfully", "userId", String.valueOf(user.getId())));
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setHashPassword(passwordEncoder.encode(request.password()));
        user.setRole("RECRUITER".equalsIgnoreCase(request.role()) ? Role.RECRUITER : Role.CANDIDATE);
        user.setOtpAttempts(0);
        user = userRepository.save(user);

        issueAndSendOtp(user);

        return new ServiceResult(HttpStatus.CREATED,
                java.util.Map.of("msg", "User created. OTP sent to your email.", "user", toUserResponse(user)));
    }

    @Transactional
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.isVerified()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "User is already verified");
        }
        if (user.getOtpAttempts() >= MAX_OTP_ATTEMPTS) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Maximum OTP resend attempts reached. Try again later.");
        }
        issueAndSendOtp(user);
    }

    @Transactional
    public VerifyResult verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.isVerified()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "User already verified");
        }

        String cleanOtp = otp.trim();
        if (user.getOtp() == null || !user.getOtp().equals(cleanOtp)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }
        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "OTP expired");
        }

        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiresAt(null);
        user.setOtpAttempts(0);
        user = userRepository.save(user);

        String token = jwtUtil.generateAuthToken(user.getEmail(), user.getId(), user.getRole());
        return new VerifyResult(token, toUserResponse(user));
    }

    @Transactional(readOnly = true)
    public LoginResult login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!user.isVerified()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        if (!passwordEncoder.matches(password, user.getHashPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        Profile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        String token = jwtUtil.generateAuthToken(user.getEmail(), user.getId(), user.getRole());
        return new LoginResult(token, toProfileResponse(profile), toUserResponse(user));
    }

    @Transactional(readOnly = true)
    public CurrentUserResult getCurrentUser(String token) {
        if (token == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "No token provided");
        }

        Long userId;
        try {
            Claims claims = jwtUtil.parseToken(token);
            userId = jwtUtil.extractUserId(claims);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "User not found", true);
        }

        Profile profile = profileRepository.findByUserId(userId).orElse(null);
        return new CurrentUserResult(toUserResponse(user), toProfileResponse(profile));
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return toUserSummaryResponse(user);
    }

    @Transactional
    public void forgotPassword(String email, String frontendUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        String token = jwtUtil.generatePasswordResetToken(user.getEmail(), user.getId());
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        mailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetUrl);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        try {
            Claims claims = jwtUtil.parseToken(token);
            Long userId = jwtUtil.extractUserId(claims);
            User user = userRepository.findById(userId).orElseThrow();
            user.setHashPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired token");
        }
    }

    private void issueAndSendOtp(User user) {
        if (user.getOtpAttempts() >= MAX_OTP_ATTEMPTS) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Maximum OTP resend attempts reached");
        }
        String otp = String.valueOf(100000 + RANDOM.nextInt(900000));
        user.setOtp(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(15));
        user.setOtpAttempts(user.getOtpAttempts() + 1);
        userRepository.save(user);
        mailService.sendOtpEmail(user.getEmail(), otp);
    }
}
