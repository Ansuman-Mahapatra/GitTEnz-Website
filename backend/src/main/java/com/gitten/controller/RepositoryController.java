package com.gitten.controller;

import com.gitten.model.Repository;
import com.gitten.repository.RepositoryRepository;
import com.gitten.repository.UserRepository;
import com.gitten.service.RepositoryService;
import com.gitten.service.LocalGitService;
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

@RestController
@RequestMapping("/api/repos")
public class RepositoryController {

    private final RepositoryService repositoryService;
    private final com.gitten.service.GitHubService gitHubService;
    private final UserRepository userRepository;

    private final LocalGitService localGitService;

    public RepositoryController(RepositoryService repositoryService, com.gitten.service.GitHubService gitHubService,
            UserRepository userRepository, com.gitten.service.LocalGitService localGitService) {
        this.repositoryService = repositoryService;
        this.gitHubService = gitHubService;
        this.userRepository = userRepository;
        this.localGitService = localGitService;
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

    @GetMapping("/{owner}/{repo}/branches")
    public ResponseEntity<?> getBranches(@PathVariable String owner, @PathVariable String repo,
            java.security.Principal principal) {
        String token = getToken(principal.getName());
        return ResponseEntity.ok(gitHubService.getBranches(owner, repo, token));
    }

    @GetMapping("/{owner}/{repo}/commits")
    public ResponseEntity<?> getCommits(@PathVariable String owner, @PathVariable String repo,
            @RequestParam(required = false) String branch, java.security.Principal principal) {
        String token = getToken(principal.getName());
        return ResponseEntity.ok(gitHubService.getCommits(owner, repo, branch, token));
    }

    @GetMapping("/{owner}/{repo}/tree/{sha}")
    public ResponseEntity<?> getTree(@PathVariable String owner, @PathVariable String repo, @PathVariable String sha,
            java.security.Principal principal) {
        String token = getToken(principal.getName());
        return ResponseEntity.ok(gitHubService.getFileTree(owner, repo, sha, token));
    }

    @GetMapping("/{owner}/{repo}/contents/**")
    public ResponseEntity<?> getContent(@PathVariable String owner, @PathVariable String repo,
            HttpServletRequest request, java.security.Principal principal) {
        // Extract path from pattern
        String fullPath = (String) request
                .getAttribute(org.springframework.web.servlet.HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        // /api/repos/{owner}/{repo}/contents/PATH -> we want PATH.
        // prefix length: /api/repos/owner/repo/contents/ is 23 + owner + repo length
        // Safer way: split or substring
        String prefix = "/api/repos/" + owner + "/" + repo + "/contents/";
        String path = fullPath.substring(fullPath.indexOf(prefix) + prefix.length());

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

        String token = getToken(principal.getName());
        return ResponseEntity.ok(gitHubService.updateFile(owner, repo, path, body.get("content"), body.get("message"),
                body.get("sha"), token));
    }

    @org.springframework.web.bind.annotation.PostMapping("/{owner}/{repo}/branches")
    public ResponseEntity<?> createBranch(@PathVariable String owner, @PathVariable String repo,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> body,
            java.security.Principal principal) {
        String token = getToken(principal.getName());
        return ResponseEntity
                .ok(gitHubService.createBranch(owner, repo, body.get("branchName"), body.get("sha"), token));
    }

    private String getToken(String username) {
        return userRepository.findByUsername(username)
                .map(com.gitten.model.User::getAccessToken)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
