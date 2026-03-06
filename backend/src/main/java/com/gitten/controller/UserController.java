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

    public UserController(GitHubService gitHubService, com.gitten.repository.UserRepository userRepository,
            com.gitten.repository.RepositoryRepository repositoryRepository) {
        this.gitHubService = gitHubService;
        this.userRepository = userRepository;
        this.repositoryRepository = repositoryRepository;
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

        return userRepository.save(user);
    }

    @GetMapping("/activity")
    public List<java.util.Map<String, Object>> getActivity(java.security.Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String gitUsername = user.getUsername();
        if ("admin".equalsIgnoreCase(gitUsername) ||
                "AnsumanLocal".equalsIgnoreCase(gitUsername) ||
                "h".equalsIgnoreCase(gitUsername) ||
                "noth".equalsIgnoreCase(gitUsername) ||
                "@nothing".equalsIgnoreCase(gitUsername) ||
                gitUsername.toLowerCase().contains("ansuman") ||
                (user.getGithubId() == null && (user.getAccessToken() == null || user.getAccessToken().isEmpty()))) {
            // Default to author's github for testing / admin dashboards where username
            // isn't a GH handle
            gitUsername = "Ansuman-Mahapatra";
            user.setAccessToken(null); // Use public unauthenticated API to avoid 401 from expired test tokens
        }

        return gitHubService.getUserEvents(gitUsername, user.getAccessToken());
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
