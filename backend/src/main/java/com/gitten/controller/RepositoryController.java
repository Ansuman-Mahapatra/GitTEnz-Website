package com.gitten.controller;

import com.gitten.model.Repository;
import com.gitten.repository.RepositoryRepository;
import com.gitten.repository.UserRepository;
import com.gitten.service.RepositoryService;
import com.gitten.service.LocalGitService;
import com.gitten.service.GitHubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/repos")
public class RepositoryController {

    private final RepositoryService repositoryService;
    private final GitHubService gitHubService;
    private final UserRepository userRepository;
    private final RepositoryRepository repositoryRepository;

    private final LocalGitService localGitService;

    public RepositoryController(RepositoryService repositoryService, GitHubService gitHubService,
            UserRepository userRepository, LocalGitService localGitService, RepositoryRepository repositoryRepository) {
        this.repositoryService = repositoryService;
        this.gitHubService = gitHubService;
        this.userRepository = userRepository;
        this.localGitService = localGitService;
        this.repositoryRepository = repositoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<Repository>> getMyRepositories(java.security.Principal principal) {
        String username = principal.getName();
        List<Repository> repos = repositoryService.getRepositoriesByUsername(username);
        return ResponseEntity.ok(repos);
    }

    @GetMapping("/local")
    public ResponseEntity<List<Repository>> getLocalRepositories(@RequestParam String path) {
        return ResponseEntity.ok(localGitService.scanLocalRepositories(path));
    }

    @org.springframework.web.bind.annotation.PostMapping("/local-save")
    public ResponseEntity<Repository> saveLocalRepo(
            @org.springframework.web.bind.annotation.RequestBody Repository repo, java.security.Principal principal) {
        com.gitten.model.User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        repo.setOwner(user);
        repo.setLocal(true);
        // Ensure no ID collision for new repo
        repo.setId(null);
        return ResponseEntity.ok(repositoryRepository.save(repo));
    }

    private Repository findLocalRepo(String ownerUsername, String repoName) {
        Optional<com.gitten.model.User> userOpt = userRepository.findByUsername(ownerUsername);
        if (userOpt.isEmpty())
            return null;

        Optional<Repository> repoOpt = repositoryRepository.findByOwnerAndName(userOpt.get(), repoName);
        if (repoOpt.isPresent() && repoOpt.get().isLocal()) {
            return repoOpt.get();
        }
        return null;
    }

    @GetMapping("/{owner}/{repo}/branches")
    public ResponseEntity<?> getBranches(@PathVariable String owner, @PathVariable String repo,
            java.security.Principal principal) {
        Repository localRepo = findLocalRepo(owner, repo);
        if (localRepo != null) {
            return ResponseEntity.ok(localGitService.getBranches(localRepo.getLocalPath()));
        }

        String token = getToken(principal.getName());
        return ResponseEntity.ok(gitHubService.getBranches(owner, repo, token));
    }

    @GetMapping("/{owner}/{repo}/commits")
    public ResponseEntity<?> getCommits(@PathVariable String owner, @PathVariable String repo,
            @RequestParam(required = false) String branch, java.security.Principal principal) {
        Repository localRepo = findLocalRepo(owner, repo);
        if (localRepo != null) {
            return ResponseEntity.ok(localGitService.getCommits(localRepo.getLocalPath(), branch));
        }

        String token = getToken(principal.getName());
        return ResponseEntity.ok(gitHubService.getCommits(owner, repo, branch, token));
    }

    @GetMapping("/{owner}/{repo}/tree/{sha}")
    public ResponseEntity<?> getTree(@PathVariable String owner, @PathVariable String repo, @PathVariable String sha,
            java.security.Principal principal) {
        Repository localRepo = findLocalRepo(owner, repo);
        if (localRepo != null) {
            return ResponseEntity.ok(localGitService.getFileTree(localRepo.getLocalPath(), sha));
        }

        String token = getToken(principal.getName());
        return ResponseEntity.ok(gitHubService.getFileTree(owner, repo, sha, token));
    }

    @GetMapping("/{owner}/{repo}/contents/**")
    public ResponseEntity<?> getContent(@PathVariable String owner, @PathVariable String repo,
            HttpServletRequest request, java.security.Principal principal) {
        // Extract path from pattern
        String fullPath = (String) request
                .getAttribute(org.springframework.web.servlet.HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        String prefix = "/api/repos/" + owner + "/" + repo + "/contents/";
        String path = fullPath.substring(fullPath.indexOf(prefix) + prefix.length());

        Repository localRepo = findLocalRepo(owner, repo);
        if (localRepo != null) {
            return ResponseEntity.ok(localGitService.getFileContent(localRepo.getLocalPath(), path));
        }

        String token = getToken(principal.getName());
        return ResponseEntity.ok(gitHubService.getFileContent(owner, repo, path, token));
    }

    @org.springframework.web.bind.annotation.PutMapping("/{owner}/{repo}/contents/**")
    public ResponseEntity<?> updateContent(@PathVariable String owner, @PathVariable String repo,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> body,
            HttpServletRequest request, java.security.Principal principal) {
        String fullPath = (String) request
                .getAttribute(org.springframework.web.servlet.HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        String prefix = "/api/repos/" + owner + "/" + repo + "/contents/";
        String path = fullPath.substring(fullPath.indexOf(prefix) + prefix.length());

        Repository localRepo = findLocalRepo(owner, repo);
        if (localRepo != null) {
            return ResponseEntity.ok(localGitService.updateFile(localRepo.getLocalPath(), path, body.get("content"),
                    body.get("message")));
        }

        String token = getToken(principal.getName());
        return ResponseEntity.ok(gitHubService.updateFile(owner, repo, path, body.get("content"), body.get("message"),
                body.get("sha"), token));
    }

    @org.springframework.web.bind.annotation.PostMapping("/{owner}/{repo}/branches")
    public ResponseEntity<?> createBranch(@PathVariable String owner, @PathVariable String repo,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> body,
            java.security.Principal principal) {
        Repository localRepo = findLocalRepo(owner, repo);
        if (localRepo != null) {
            return ResponseEntity.ok(
                    localGitService.createBranch(localRepo.getLocalPath(), body.get("branchName"), body.get("sha")));
        }

        String token = getToken(principal.getName());
        return ResponseEntity
                .ok(gitHubService.createBranch(owner, repo, body.get("branchName"), body.get("sha"), token));
    }

    private String getToken(String username) {
        return userRepository.findByUsername(username)
                .map(com.gitten.model.User::getAccessToken)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @org.springframework.web.bind.annotation.PostMapping("/{id}/toggle-star")
    public Repository toggleStar(@PathVariable String id, java.security.Principal principal) {
        com.gitten.model.User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Repository repo = repositoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Repository not found"));

        if (repo.getLikedUserIds().contains(user.getId())) {
            repo.getLikedUserIds().remove(user.getId());
        } else {
            repo.getLikedUserIds().add(user.getId());
        }

        return repositoryRepository.save(repo);
    }
}
