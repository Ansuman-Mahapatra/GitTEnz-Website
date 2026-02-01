package com.gitten.service;

import com.gitten.model.Repository;
import com.gitten.model.User;
import java.util.List;

public interface GitHubService {
        User syncUser(String oauthToken);

        List<Repository> syncRepositories(User user, String oauthToken);

        // New methods for detailed view
        List<java.util.Map<String, Object>> getBranches(String owner, String repo, String oauthToken);

        List<java.util.Map<String, Object>> getCommits(String owner, String repo, String branch, String oauthToken);

        java.util.Map<String, Object> getFileTree(String owner, String repo, String sha, String oauthToken);

        java.util.Map<String, Object> getFileContent(String owner, String repo, String path, String oauthToken);

        java.util.Map<String, Object> updateFile(String owner, String repo, String path, String content, String message,
                        String sha, String oauthToken);

        java.util.Map<String, Object> createBranch(String owner, String repo, String branchName, String sha,
                        String oauthToken);

        List<java.util.Map<String, Object>> getUserEvents(String username, String oauthToken);

        List<java.util.Map<String, Object>> getStarredRepositories(String username, String oauthToken);
}
