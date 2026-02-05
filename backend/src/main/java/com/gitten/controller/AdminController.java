package com.gitten.controller;

import com.gitten.model.Feedback;
import com.gitten.model.SystemConfig;
import com.gitten.model.User;
import com.gitten.repository.FeedbackRepository;
import com.gitten.repository.SystemConfigRepository;
import com.gitten.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final FeedbackRepository feedbackRepository;
    private final SystemConfigRepository systemConfigRepository;

    public AdminController(UserRepository userRepository, FeedbackRepository feedbackRepository,
            SystemConfigRepository systemConfigRepository) {
        this.userRepository = userRepository;
        this.feedbackRepository = feedbackRepository;
        this.systemConfigRepository = systemConfigRepository;
    }

    private boolean isAdmin(Principal principal) {
        // Enforce the "Permanent Account" rule by checking specific username
        return "admin".equals(principal.getName());
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(Principal principal) {
        if (!isAdmin(principal))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/feedback")
    public ResponseEntity<?> getAllFeedback(Principal principal) {
        if (!isAdmin(principal))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        return ResponseEntity.ok(feedbackRepository.findAll());
    }

    @GetMapping("/privacy-policy")
    public ResponseEntity<?> getPrivacyPolicy() {
        // Publicly accessible? Or admin only? Probably public, but editing is admin.
        // For this controller, we'll keep it general.
        // Actually, the user asked for "admin setting... can see set privacy policy".
        // Reading it should probably be public, but let's put it here for Admin
        // viewing/editing.
        return ResponseEntity.ok(systemConfigRepository.findByKey("privacy_policy")
                .map(SystemConfig::getValue).orElse("Default Privacy Policy"));
    }

    @PostMapping("/privacy-policy")
    public ResponseEntity<?> updatePrivacyPolicy(@RequestBody Map<String, String> body, Principal principal) {
        if (!isAdmin(principal))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");

        String content = body.get("content");
        SystemConfig config = systemConfigRepository.findByKey("privacy_policy")
                .orElse(new SystemConfig("privacy_policy", ""));
        config.setValue(content);
        systemConfigRepository.save(config);

        return ResponseEntity.ok("Privacy Policy updated");
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, Object> updates,
            Principal principal) {
        if (!isAdmin(principal))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");

        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        // Role updates removed as requested.
        // User settings can be expanded here later.
        // Add other fields as needed

        userRepository.save(user);

    @PutMapping("/users/{id}/password")
    public ResponseEntity<?> updateUserPassword(@PathVariable String id, @RequestBody Map<String, String> body,
            Principal principal) {
        if (!isAdmin(principal))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");

        String newPassword = body.get("password");
        if (newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required");
        }

        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(new BCryptPasswordEncoder().encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok("Password updated successfully");
    }
}
