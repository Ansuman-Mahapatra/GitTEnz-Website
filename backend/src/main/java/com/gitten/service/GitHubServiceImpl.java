package com.gitten.service;

import com.gitten.dto.GitHubRepositoryDTO;
import com.gitten.dto.GitHubUserDTO;
import com.gitten.model.Repository;
import com.gitten.model.User;
import com.gitten.repository.RepositoryRepository;
import com.gitten.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.http.MediaType;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubServiceImpl implements GitHubService {

    private final RestClient restClient;
    private final UserRepository userRepository;
    private final RepositoryRepository repositoryRepository;

    @Override
    @Transactional
    public User syncUser(String oauthToken) {
        log.info("Syncing user with token: {}", oauthToken.substring(0, 10) + "...");
        GitHubUserDTO gitHubUser = restClient.get()
                .uri("/user")
                .header("Authorization", "Bearer " + oauthToken)
                .retrieve()
                .body(GitHubUserDTO.class);

        if (gitHubUser == null) {
            throw new RuntimeException("Failed to fetch user from GitHub");
        }

        User user = userRepository.findByGithubId(String.valueOf(gitHubUser.getId()))
                .orElse(new User());

        user.setGithubId(String.valueOf(gitHubUser.getId()));
        user.setUsername(gitHubUser.getLogin());
        user.setName(gitHubUser.getName());
        user.setEmail(gitHubUser.getEmail());
        user.setAvatarUrl(gitHubUser.getAvatarUrl());
        user.setLastGithubVerifiedAt(java.time.Instant.now());

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public List<Repository> syncRepositories(User user, String oauthToken) {
        log.info("Syncing repositories for user: {}", user.getUsername());
        
        List<GitHubRepositoryDTO> allDtos = new ArrayList<>();
        int pageNum = 1;
        while (pageNum <= 10) { // Limit to 1000 repos for safety
            List<GitHubRepositoryDTO> dtos = restClient.get()
                .uri("/user/repos?per_page=100&type=owner&sort=updated&page=" + pageNum)
                .header("Authorization", "Bearer " + oauthToken)
                .retrieve()
                .body(new ParameterizedTypeReference<List<GitHubRepositoryDTO>>() {
                });
            
            if (dtos == null || dtos.isEmpty()) break;
            allDtos.addAll(dtos);
            if (dtos.size() < 100) break;
            pageNum++;
        }

        if (allDtos.isEmpty()) {
            // Check if we previously had repos, maybe token expired or something else
            // but if we definitely have user access, we shouldn't mark everything as deleted if GitHub just returned empty
            // however if user has 0 repos, they should be empty.
            // For now, only proceed with deletion detection if we fetched at least one repo OR if we are sure it's 0.
        }

        // Detect deletions on GitHub
        java.util.Set<Long> githubIds = new java.util.HashSet<>();
        java.util.Set<String> githubNames = new java.util.HashSet<>();
        for (GitHubRepositoryDTO dto : allDtos) {
            githubIds.add(dto.getId());
            githubNames.add(dto.getName().toLowerCase());
        }

        // Check our local DB for repos that are NOT on GitHub anymore
        List<Repository> localRepos = repositoryRepository.findByOwner(user);
        for (Repository localRepo : localRepos) {
            boolean isMissingOnGithub = false;
            
            if (localRepo.getGithubId() != null) {
                if (!githubIds.contains(localRepo.getGithubId())) {
                    isMissingOnGithub = true;
                }
            } else if (localRepo.getHtmlUrl() != null && localRepo.getHtmlUrl().contains("github.com")) {
                // If it claims to be on GitHub but isn't in our ID list AND isn't in our name list
                if (!githubNames.contains(localRepo.getName().toLowerCase())) {
                    isMissingOnGithub = true;
                }
            } else if (!localRepo.isLocal()) {
                // Mock repo case: not local but no ID and not in the list
                isMissingOnGithub = true;
            }

            if (isMissingOnGithub) {
                if (!localRepo.isDeletedOnGithub()) {
                    log.warn("Repository {} was deleted on GitHub, marking as deleted.", localRepo.getName());
                    localRepo.setDeletedOnGithub(true);
                    localRepo.setDeletedAt(java.time.LocalDateTime.now());
                    repositoryRepository.save(localRepo);
                }
            } else {
                // Exists or is purely local
                if (localRepo.getGithubId() != null && localRepo.isDeletedOnGithub()) {
                    localRepo.setDeletedOnGithub(false);
                    localRepo.setDeletedAt(null);
                    repositoryRepository.save(localRepo);
                }
            }
        }

        List<Repository> repositories = new ArrayList<>();
        for (GitHubRepositoryDTO dto : allDtos) {
            // Try to find by GitHub ID first
            Optional<Repository> existingById = repositoryRepository.findByGithubId(dto.getId());
            
            Repository repo;
            if (existingById.isPresent()) {
                repo = existingById.get();
            } else {
                // If ID didn't match, maybe it was a previously local repo with same name
                Optional<Repository> existingByName = repositoryRepository.findByOwner(user)
                    .stream()
                    .filter(r -> r.getName().equalsIgnoreCase(dto.getName()))
                    .findFirst();
                
                if (existingByName.isPresent()) {
                    repo = existingByName.get();
                    log.info("Linked existing local repository {} to GitHub ID {}", dto.getName(), dto.getId());
                } else {
                    repo = new Repository();
                }
            }

            repo.setGithubId(dto.getId());
            repo.setName(dto.getName());
            repo.setFullName(dto.getFullName());
            repo.setDescription(dto.getDescription());
            repo.setHtmlUrl(dto.getHtmlUrl());
            repo.setLanguage(dto.getLanguage());
            repo.setStargazersCount(dto.getStargazersCount());
            repo.setForksCount(dto.getForksCount());
            repo.setOpenIssuesCount(dto.getOpenIssuesCount());
            repo.setUpdatedAt(dto.getUpdatedAt());
            repo.setOwner(user);
            repo.setDeletedOnGithub(false); 
            repo.setDeletedAt(null);

            repositories.add(repositoryRepository.save(repo));
        }
        return repositories;
    }

    @Override
    public List<java.util.Map<String, Object>> getBranches(String owner, String repo, String oauthToken) {
        log.info("Fetching branches for {}/{}", owner, repo);
        return restClient.get()
                .uri("/repos/" + owner + "/" + repo + "/branches")
                .header("Authorization", "Bearer " + oauthToken)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
    }

    @Override
    public List<java.util.Map<String, Object>> getCommits(String owner, String repo, String branch, String oauthToken) {
        log.info("Fetching commits for {}/{} branch: {}", owner, repo, branch);
        String uri = "/repos/" + owner + "/" + repo + "/commits";
        if (branch != null && !branch.isEmpty()) {
            uri += "?sha=" + branch;
        }
        return restClient.get()
                .uri(uri)
                .header("Authorization", "Bearer " + oauthToken)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
    }

    @Override
    public java.util.Map<String, Object> getFileTree(String owner, String repo, String sha, String oauthToken) {
        log.info("Fetching tree for {}/{} sha: {}", owner, repo, sha);
        return restClient.get()
                .uri("/repos/" + owner + "/" + repo + "/git/trees/" + sha + "?recursive=1")
                .header("Authorization", "Bearer " + oauthToken)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
    }

    @Override
    public java.util.Map<String, Object> getFileContent(String owner, String repo, String path, String oauthToken) {
        log.info("Fetching content for {}/{} path: {}", owner, repo, path);
        return restClient.get()
                .uri("/repos/" + owner + "/" + repo + "/contents/" + path)
                .header("Authorization", "Bearer " + oauthToken)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
    }

    @Override
    public java.util.Map<String, Object> updateFile(String owner, String repo, String path, String content,
            String message, String sha, String oauthToken, boolean isBase64) {
        log.info("Updating file {}/{} path: {} (isBase64: {})", owner, repo, path, isBase64);
        
        // Content must be base64 encoded for GitHub API
        String encodedContent = isBase64 ? content : java.util.Base64.getEncoder().encodeToString(content.getBytes());

        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("message", message);
        body.put("content", encodedContent);
        if (sha != null && !sha.isEmpty()) {
            body.put("sha", sha);
        }

        return restClient.put()
                .uri("/repos/" + owner + "/" + repo + "/contents/" + path)
                .header("Authorization", "Bearer " + oauthToken)
                .contentType(Objects.requireNonNull(org.springframework.http.MediaType.APPLICATION_JSON))
                .body(body)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
    }

    @Override
    public java.util.Map<String, Object> createBranch(String owner, String repo, String branchName, String sha,
            String oauthToken) {
        log.info("Creating branch {} in {}/{}", branchName, owner, repo);

        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("ref", "refs/heads/" + branchName);
        body.put("sha", sha);

        return restClient.post()
                .uri("/repos/" + owner + "/" + repo + "/git/refs")
                .header("Authorization", "Bearer " + oauthToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
    }

    @Override
    public List<java.util.Map<String, Object>> getUserEvents(String username, String oauthToken) {
        log.info("Fetching events for user: {}", username);
        try {
            List<java.util.Map<String, Object>> allEvents = new ArrayList<>();
            for (int page = 1; page <= 3; page++) {
                var request = restClient.get().uri("/users/" + username + "/events?per_page=100&page=" + page);
                if (oauthToken != null && !oauthToken.isEmpty()) {
                    request.header("Authorization", "Bearer " + oauthToken);
                }
                List<java.util.Map<String, Object>> responsePage = request.retrieve()
                        .body(new ParameterizedTypeReference<>() {
                        });
                if (responsePage != null && !responsePage.isEmpty()) {
                    allEvents.addAll(responsePage);
                    if (responsePage.size() < 100)
                        break;
                } else {
                    break;
                }
            }
            return allEvents;
        } catch (Exception e) {
            log.error("Failed to fetch events for {}: {}", username, e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public List<java.util.Map<String, Object>> getStarredRepositories(String username, String oauthToken) {
        log.info("Fetching starred repositories for user: {}", username);
        try {
            var request = restClient.get().uri("/users/" + username + "/starred?per_page=100&sort=created");
            if (oauthToken != null && !oauthToken.isEmpty()) {
                request.header("Authorization", "Bearer " + oauthToken);
            }
            return request.retrieve().body(new ParameterizedTypeReference<>() {
            });
        } catch (Exception e) {
            log.error("Failed to fetch starred repos for {}: {}", username, e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public java.util.Map<String, Object> createRepository(String name, String description, boolean isPrivate,
            String oauthToken) {
        log.info("Creating repository on GitHub: {}", name);

        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("name", name);
        body.put("description", description);
        body.put("private", isPrivate);
        body.put("auto_init", false); // We'll push our own local git history

        return restClient.post()
                .uri("/user/repos")
                .header("Authorization", "Bearer " + oauthToken)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
    }
}
