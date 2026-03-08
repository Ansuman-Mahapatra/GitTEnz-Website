package com.gitten.controller;

import com.gitten.model.Repository;
import com.gitten.model.User;
import com.gitten.service.GitHubService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final GitHubService gitHubService;
    private final com.gitten.repository.UserRepository userRepository;
    private final com.gitten.repository.RepositoryRepository repositoryRepository;
    private final com.gitten.service.NotificationService notificationService;
    private final com.gitten.repository.NotificationRepository notificationRepository;

    public UserController(GitHubService gitHubService,
            com.gitten.repository.UserRepository userRepository,
            com.gitten.repository.RepositoryRepository repositoryRepository,
            com.gitten.service.NotificationService notificationService,
            com.gitten.repository.NotificationRepository notificationRepository) {
        this.gitHubService = gitHubService;
        this.userRepository = userRepository;
        this.repositoryRepository = repositoryRepository;
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/me")
    public User getCurrentUser(java.security.Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/sync")
    public List<Repository> syncRepositories(java.security.Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return gitHubService.syncRepositories(user, user.getAccessToken());
    }

    @PutMapping("/profile")
    public User updateProfile(@RequestBody User userUpdates, java.security.Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userUpdates.getName() != null)
            user.setName(userUpdates.getName());
        if (userUpdates.getEmail() != null)
            user.setEmail(userUpdates.getEmail());
        if (userUpdates.getAvatarUrl() != null)
            user.setAvatarUrl(userUpdates.getAvatarUrl());
        if (userUpdates.getNotificationPreferences() != null)
            user.setNotificationPreferences(userUpdates.getNotificationPreferences());
        if (userUpdates.getAiApiKey() != null)
            user.setAiApiKey(userUpdates.getAiApiKey());

        return userRepository.save(user);
    }

    @GetMapping("/activity")
    public List<java.util.Map<String, Object>> getActivity(java.security.Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String gitUsername = user.getUsername();
        if (gitUsername == null || gitUsername.isEmpty() || gitUsername.equalsIgnoreCase("admin")) {
            // Default to author's github only if no username is found (e.g. fresh local
            // test account)
            gitUsername = "Ansuman-Mahapatra";
            user.setAccessToken(null);
        }

        List<java.util.Map<String, Object>> events = gitHubService.getUserEvents(gitUsername, user.getAccessToken());

        // Sync notifications from events
        if (user.getId() != null) {
            final String finalUserId = user.getId();
            events.stream().limit(20).forEach(event -> {
                String type = (String) event.get("type");
                java.util.Map<String, Object> repo = (java.util.Map<String, Object>) event.get("repo");
                String repoName = repo != null ? (String) repo.get("name") : "unknown repo";

                // Check if we already notified for this eventId (use a unique message prefix or
                // similar)
                // For simplicity, we'll check if a notification with this message already
                // exists for the user
                String message = "";
                String notifyType = "";

                if ("PushEvent".equals(type)) {
                    notifyType = "PUSH";
                    message = "New push to " + repoName;
                } else if ("PullRequestEvent".equals(type)) {
                    notifyType = "PULL";
                    java.util.Map<String, Object> payload = (java.util.Map<String, Object>) event.get("payload");
                    String action = (String) payload.get("action");
                    message = "Pull Request " + action + " in " + repoName;
                } else if ("IssuesEvent".equals(type)) {
                    notifyType = "ISSUE";
                    java.util.Map<String, Object> payload = (java.util.Map<String, Object>) event.get("payload");
                    String action = (String) payload.get("action");
                    message = "Issue " + action + " in " + repoName;
                }

                if (!message.isEmpty()) {
                    final String finalMsg = message;
                    final String finalType = notifyType;
                    // Check for duplicates in last 10 notifications
                    boolean exists = notificationRepository.findByUserIdOrderByCreatedAtDesc(finalUserId)
                            .stream().limit(10).anyMatch(n -> n.getMessage().equals(finalMsg));

                    if (!exists) {
                        notificationService.createNotification(finalUserId, finalType, finalMsg,
                                "https://github.com/" + repoName);
                    }
                }
            });
        }

        return events;
    }

    @GetMapping("/starred")
    public List<Repository> getStarredRepositories(java.security.Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return repositoryRepository.findByLikedUserIdsContaining(user.getId());
    }

    @PostMapping("/onboarding")
    public User completeOnboarding(java.security.Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setOnboardingCompleted(true);
        return userRepository.save(user);
    }
}
