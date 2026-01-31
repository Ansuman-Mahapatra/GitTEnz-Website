package com.gitten.service;

import com.gitten.model.Repository;
import com.gitten.model.User;
import com.gitten.repository.RepositoryRepository;
import com.gitten.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service

public class RepositoryService {

    private final RepositoryRepository repositoryRepository;
    private final UserRepository userRepository;
    private final GitHubService gitHubService;

    public RepositoryService(RepositoryRepository repositoryRepository, UserRepository userRepository,
            GitHubService gitHubService) {
        this.repositoryRepository = repositoryRepository;
        this.userRepository = userRepository;
        this.gitHubService = gitHubService;
    }

    // Remove Cacheable for now to ensure we get fresh data from GitHub
    // @Cacheable(value = "userRepos", key = "#username")
    public List<Repository> getRepositoriesByUsername(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getAccessToken() != null && !user.getAccessToken().isEmpty()) {
                syncRepositories(user);
            }
            return repositoryRepository.findByOwner(user);
        }
        return List.of();
    }

    private void syncRepositories(User user) {
        try {
            gitHubService.syncRepositories(user, user.getAccessToken());
        } catch (Exception e) {
            // Log error but continue to return cached repos
            e.printStackTrace();
        }
    }
}
