package com.gitten.controller;

import com.gitten.model.Repository;
import com.gitten.model.User;
import com.gitten.service.GitHubService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final GitHubService gitHubService;
    private final com.gitten.repository.UserRepository userRepository;

    public UserController(GitHubService gitHubService, com.gitten.repository.UserRepository userRepository) {
        this.gitHubService = gitHubService;
        this.userRepository = userRepository;
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

        return userRepository.save(user);
    }

    @GetMapping("/activity")
    public List<java.util.Map<String, Object>> getActivity(java.security.Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return gitHubService.getUserEvents(user.getUsername(), user.getAccessToken());
    }

    @GetMapping("/starred")
    public List<java.util.Map<String, Object>> getStarredRepositories(java.security.Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return gitHubService.getStarredRepositories(user.getUsername(), user.getAccessToken());
    }

    @PostMapping("/onboarding")
    public User completeOnboarding(java.security.Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setOnboardingCompleted(true);
        return userRepository.save(user);
    }
}
