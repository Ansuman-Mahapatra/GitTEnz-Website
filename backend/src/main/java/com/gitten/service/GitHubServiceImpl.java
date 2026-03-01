package com.gitten.service;

import com.gitten.dto.GitHubRepositoryDTO;
import com.gitten.dto.GitHubUserDTO;
import com.gitten.model.Repository;
import com.gitten.model.User;
import com.gitten.repository.RepositoryRepository;
import com.gitten.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
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

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public List<Repository> syncRepositories(User user, String oauthToken) {
        log.info("Syncing repositories for user: {}", user.getUsername());
        List<GitHubRepositoryDTO> dtos = restClient.get()
                .uri("/user/repos?per_page=100&type=owner&sort=updated")
                .header("Authorization", "Bearer " + oauthToken)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });

        if (dtos == null)
            return new ArrayList<>();

        List<Repository> repositories = new ArrayList<>();
        for (GitHubRepositoryDTO dto : dtos) {
            Repository repo = repositoryRepository.findByGithubId(dto.getId())
                    .orElse(new Repository());

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
            String message, String sha, String oauthToken) {
        log.info("Updating file {}/{} path: {}", owner, repo, path);
        // Content must be base64 encoded
        String encodedContent = java.util.Base64.getEncoder().encodeToString(content.getBytes());

        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("message", message);
        body.put("content", encodedContent);
        if (sha != null && !sha.isEmpty()) {
            body.put("sha", sha);
        }

        return restClient.put()
                .uri("/repos/" + owner + "/" + repo + "/contents/" + path)
                .header("Authorization", "Bearer " + oauthToken)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
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
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
    }

    @Override
    public List<java.util.Map<String, Object>> getUserEvents(String username, String oauthToken) {
        log.info("Fetching events for user: {}", username);
        if (oauthToken == null || oauthToken.isEmpty()) {
            return new ArrayList<>();
        }
        return restClient.get()
                .uri("/users/" + username + "/events?per_page=100")
                .header("Authorization", "Bearer " + oauthToken)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
    }

    @Override
    public List<java.util.Map<String, Object>> getStarredRepositories(String username, String oauthToken) {
        log.info("Fetching starred repositories for user: {}", username);
        if (oauthToken == null || oauthToken.isEmpty()) {
            return new ArrayList<>();
        }
        return restClient.get()
                .uri("/users/" + username + "/starred?per_page=100&sort=created")
                .header("Authorization", "Bearer " + oauthToken)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
    }
}
