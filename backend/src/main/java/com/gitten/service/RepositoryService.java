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
                // Sync and get the LIVE repos from GitHub
                List<Repository> liveGithubRepos = syncRepositories(user);
                
                // Also get local-only repos (those that don't have a githubId yet)
                List<Repository> localOnlyRepos = repositoryRepository.findByOwner(user)
                    .stream()
                    .filter(r -> r.isLocal() && r.getGithubId() == null && !r.isDeletedOnGithub())
                    .toList();
                
                // Combine them
                java.util.List<Repository> allActive = new java.util.ArrayList<>(liveGithubRepos);
                allActive.addAll(localOnlyRepos);
                return allActive;
            }
            return repositoryRepository.findByOwner(user);
        }
        return List.of();
    }

    public List<Repository> getDeletedRepositories(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return repositoryRepository.findByOwner(user)
                .stream()
                .filter(Repository::isDeletedOnGithub)
                .toList();
        }
        return List.of();
    }

    private List<Repository> syncRepositories(User user) {
        try {
            return gitHubService.syncRepositories(user, user.getAccessToken());
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }
}
