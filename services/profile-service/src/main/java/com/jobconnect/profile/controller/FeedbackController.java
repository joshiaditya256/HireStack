package com.jobconnect.profile.controller;

import com.jobconnect.profile.entities.Feedback;
import com.jobconnect.profile.entities.FeedbackStatus;
import com.jobconnect.profile.entities.User;
import com.jobconnect.profile.repository.FeedbackRepository;
import com.jobconnect.profile.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("msg", "Unauthorized"));
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("msg", "Admin access required"));
        }

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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("msg", "Admin access required"));
        }

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
