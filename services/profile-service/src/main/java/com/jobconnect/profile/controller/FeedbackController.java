package com.jobconnect.profile.controller;

import com.jobconnect.profile.entities.Feedback;
import com.jobconnect.profile.entities.FeedbackStatus;
import com.jobconnect.profile.entities.User;
import com.jobconnect.profile.repository.FeedbackRepository;
import com.jobconnect.profile.repository.UserRepository;
import com.jobconnect.profile.security.AccessGuard;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@AllArgsConstructor
@RequestMapping("/api/profile/feedback")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    // BUGFIX: this used to read Spring Security's SecurityContextHolder, but nothing in
    // profile-service ever populated it (no Spring Security filter chain runs here at all) --
    // so auth was always anonymous/null and every request to this endpoint 401'd regardless of
    // whether the caller was actually logged in. Now reads the gateway-validated identity via
    // AccessGuard, the same pattern the rest of this service uses.
    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, String> body) {
        Long userId = AccessGuard.requireUserId();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("msg", "User not found"));
        }

        String message = body.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("msg", "Message is required"));
        }

        Feedback feedback = new Feedback();
        feedback.setUserId(user.getId());
        feedback.setMessage(message);
        feedback.setStatus(FeedbackStatus.PENDING);

        feedbackRepository.save(feedback);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("msg", "Feedback submitted successfully"));
    }

    @GetMapping
    public ResponseEntity<?> getAllFeedback() {
        AccessGuard.requireAdmin();

        List<Feedback> feedbacks = feedbackRepository.findAllByOrderByCreatedAtDesc();
        
        // Join with user info (basic implementation)
        List<Map<String, Object>> response = feedbacks.stream().map(f -> {
            User user = userRepository.findById(f.getUserId()).orElse(null);
            Map<String, Object> map = new HashMap<>();
            map.put("feedback_id", f.getId());
            map.put("message", f.getMessage());
            map.put("status", f.getStatus());
            map.put("createdAt", f.getCreatedAt());
            map.put("submitterName", user != null ? user.getName() : "Unknown");
            map.put("submitterEmail", user != null ? user.getEmail() : "Unknown");
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateFeedbackStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        AccessGuard.requireAdmin();

        String statusStr = body.get("status");
        if (statusStr == null || !statusStr.equals("SOLVED")) {
            return ResponseEntity.badRequest().body(Map.of("msg", "Invalid status update"));
        }

        Feedback feedback = feedbackRepository.findById(id).orElse(null);
        if (feedback == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("msg", "Feedback not found"));
        }

        feedback.setStatus(FeedbackStatus.SOLVED);
        feedbackRepository.save(feedback);

        return ResponseEntity.ok(Map.of("msg", "Feedback status updated to SOLVED"));
    }
}
