package com.gitten.controller;

import com.gitten.model.Feedback;
import com.gitten.model.SystemConfig;
import com.gitten.model.User;
import com.gitten.repository.FeedbackRepository;
import com.gitten.repository.SystemConfigRepository;
import com.gitten.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
    private final com.gitten.repository.RepositoryRepository repositoryRepository;

    public AdminController(UserRepository userRepository, FeedbackRepository feedbackRepository,
            SystemConfigRepository systemConfigRepository,
            com.gitten.repository.RepositoryRepository repositoryRepository) {
        this.userRepository = userRepository;
        this.feedbackRepository = feedbackRepository;
        this.systemConfigRepository = systemConfigRepository;
        this.repositoryRepository = repositoryRepository;
    }

    private boolean isAdmin(Principal principal) {
        // Enforce the "Permanent Account" rule by checking specific username
        return "admin".equals(principal.getName());
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(Principal principal) {
        if (!isAdmin(principal))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");

        long totalUsers = userRepository.count();
        long totalRepos = repositoryRepository.count();
        long totalFeedback = feedbackRepository.count();

        // User Growth (Simulated for now if createdAt is mostly null/new)
        // Group by createdAt date
        Map<String, Long> userGrowth = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        u -> u.getCreatedAt().toLocalDate().toString(),
                        java.util.stream.Collectors.counting()));

        // Active Users (Users with most Repos)
        // This is inefficient for large datasets but fine for now
        List<Map<String, Object>> activeUsers = userRepository.findAll().stream()
                .map(user -> {
                    long repoCount = repositoryRepository.findByOwner(user).size();
                    return Map.of("username", user.getUsername(), "repoCount", (Object) repoCount);
                })
                .sorted((a, b) -> Long.compare((Long) b.get("repoCount"), (Long) a.get("repoCount"))) // Descending
                .limit(5)
                .collect(java.util.stream.Collectors.toList());

        // Feedback Ratings
        Map<Integer, Long> feedbackRatings = feedbackRepository.findAll().stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        f -> f.getRating(),
                        java.util.stream.Collectors.counting()));

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalRepos", totalRepos,
                "totalFeedback", totalFeedback,
                "userGrowth", userGrowth,
                "activeUsers", activeUsers,
                "feedbackRatings", feedbackRatings));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changeMyPassword(@RequestBody Map<String, String> body, Principal principal) {
        if (!isAdmin(principal))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");

        String newPassword = body.get("password");
        if (newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required");
        }

        User admin = userRepository.findByUsername("admin").orElse(null); // Assuming "admin" is unique and exists
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Admin user not found");
        }

        admin.setPassword(new BCryptPasswordEncoder().encode(newPassword));
        userRepository.save(admin);

        return ResponseEntity.ok("Password updated successfully");
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
        return ResponseEntity.ok(user);
    }

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
