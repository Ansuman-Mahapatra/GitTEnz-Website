package com.gitten.service;

import com.gitten.model.Repository;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Constants;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.PersonIdent;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevWalk;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class LocalGitService {

    public List<Repository> scanLocalRepositories(String path) {
        List<Repository> repositories = new ArrayList<>();
        File rootDir = new File(path);

        if (!rootDir.exists() || !rootDir.isDirectory()) {
            return repositories;
        }

        File[] files = rootDir.listFiles();
        if (files == null)
            return repositories;

        for (File file : files) {
            if (file.isDirectory()) {
                // Check if it's a git repo
                File gitDir = new File(file, ".git");
                if (gitDir.exists() && gitDir.isDirectory()) {
                    Repository repo = new Repository();
                    repo.setName(file.getName());
                    repo.setDescription("Local Repository at " + file.getAbsolutePath());
                    repo.setHtmlUrl("file://" + file.getAbsolutePath());
                    repo.setLocal(true);
                    repo.setLocalPath(file.getAbsolutePath());
                    repo.setVisibility("local");
                    repo.setLanguage(detectLanguage(file));
                    repo.setStargazersCount(0);
                    repo.setForksCount(0);
                    repositories.add(repo);
                }
            }
        }
        return repositories;
    }

    private String detectLanguage(File dir) {
        File[] files = dir.listFiles();
        if (files == null)
            return "Unknown";
        for (File f : files) {
            if (f.getName().endsWith(".java"))
                return "Java";
            if (f.getName().endsWith(".ts") || f.getName().endsWith(".tsx"))
                return "TypeScript";
            if (f.getName().endsWith(".js"))
                return "JavaScript";
            if (f.getName().endsWith(".py"))
                return "Python";
            if (f.getName().endsWith(".go"))
                return "Go";
            if (f.getName().endsWith(".rs"))
                return "Rust";
        }
        return "Unknown";
    }

    public List<Map<String, String>> getBranches(String localPath) {
        List<Map<String, String>> branches = new ArrayList<>();
        try (Git git = Git.open(new File(localPath))) {
            List<Ref> refs = git.branchList().call();
            for (Ref ref : refs) {
                Map<String, String> branchInfo = new HashMap<>();
                branchInfo.put("name", ref.getName().replace("refs/heads/", ""));
                branchInfo.put("sha", ref.getObjectId().getName());
                branches.add(branchInfo);
            }
        } catch (IOException | GitAPIException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to get branches for local repo: " + e.getMessage());
        }
        return branches;
    }

    public List<Map<String, Object>> getCommits(String localPath, String branch) {
        List<Map<String, Object>> commits = new ArrayList<>();
        try (Git git = Git.open(new File(localPath))) {
            Iterable<RevCommit> log = git.log().add(git.getRepository().resolve(branch != null ? branch : "HEAD"))
                    .call();
            for (RevCommit rev : log) {
                Map<String, Object> commit = new HashMap<>();
                commit.put("sha", rev.getName());

                Map<String, Object> commitData = new HashMap<>();
                commitData.put("message", rev.getFullMessage());

                Map<String, String> author = new HashMap<>();
                PersonIdent person = rev.getAuthorIdent();
                author.put("name", person.getName());
                author.put("email", person.getEmailAddress());
                author.put("date", person.getWhen().toString());

                commitData.put("author", author);
                commit.put("commit", commitData);

                commits.add(commit);
            }
        } catch (IOException | GitAPIException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to get commits for local repo: " + e.getMessage());
        }
        return commits;
    }

    public Map<String, Object> getFileTree(String localPath, String sha) {
        // For local, we scan the filesystem directly to allow live viewing
        File root = new File(localPath);
        if (!root.exists())
            throw new RuntimeException("Local path not found");

        List<Map<String, Object>> tree = new ArrayList<>();
        try (Stream<Path> walk = Files.walk(Paths.get(localPath))) {
            walk.forEach(path -> {
                File file = path.toFile();
                if (file.isDirectory() && file.getName().equals(".git"))
                    return; // Skip .git
                if (path.toString().contains(".git" + File.separator))
                    return; // Skip inside .git

                String relativePath = root.toPath().relativize(path).toString().replace("\\", "/");
                if (relativePath.isEmpty())
                    return;

                Map<String, Object> node = new HashMap<>();
                node.put("path", relativePath);
                node.put("mode", file.isDirectory() ? "040000" : "100644");
                node.put("type", file.isDirectory() ? "tree" : "blob");
                node.put("sha", "local-sha-placeholder"); // Not real sha, but needed for frontend

                // Only add top level or flat list? GitHub API returns recursive flat list for
                // ?recursive=1
                // We'll mimic recursion
                tree.add(node);
            });
        } catch (IOException e) {
            throw new RuntimeException("Failed to walk file tree: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("sha", sha);
        result.put("tree", tree);
        return result;
    }

    public Map<String, String> getFileContent(String localPath, String filePath) {
        File file = new File(localPath, filePath);
        if (!file.exists())
            throw new RuntimeException("File not found: " + filePath);

        try {
            byte[] content = Files.readAllBytes(file.toPath());
            String encoded = Base64.getEncoder().encodeToString(content);

            Map<String, String> result = new HashMap<>();
            result.put("name", file.getName());
            result.put("path", filePath);
            result.put("sha", "local-sha");
            result.put("content", encoded);
            result.put("encoding", "base64");
            return result;
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + e.getMessage());
        }
    }

    public Map<String, Object> updateFile(String localPath, String filePath, String content, String message) {
        File file = new File(localPath, filePath);
        byte[] originalContent = null;
        boolean fileExisted = file.exists();

        try {
            if (fileExisted) {
                originalContent = Files.readAllBytes(file.toPath());
            }

            // Write content
            byte[] decodedBytes = Base64.getDecoder().decode(content);
            Files.write(file.toPath(), decodedBytes);

            // Commit logic
            try (Git git = Git.open(new File(localPath))) {
                git.add().addFilepattern(filePath).call();
                RevCommit commit = git.commit().setMessage(message).call();

                Map<String, Object> result = new HashMap<>();
                Map<String, Object> c = new HashMap<>();
                c.put("sha", commit.getName());
                c.put("message", commit.getFullMessage());
                result.put("commit", c);
                result.put("content", null);
                return result;
            } catch (GitAPIException e) {
                // Revert changes if commit fails
                try {
                    if (fileExisted && originalContent != null) {
                        Files.write(file.toPath(), originalContent);
                    } else if (!fileExisted) {
                        Files.deleteIfExists(file.toPath());
                    }
                } catch (IOException ioException) {
                    // Best effort revert failed
                    throw new RuntimeException("Failed to commit changes and failed to revert file: " + e.getMessage()
                            + " | Revert error: " + ioException.getMessage());
                }
                throw new RuntimeException("Failed to commit changes, reverted file: " + e.getMessage());
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to update file: " + e.getMessage());
        }
    }

    public Map<String, Object> createBranch(String localPath, String branchName, String sha) {
        try (Git git = Git.open(new File(localPath))) {
            git.branchCreate().setName(branchName).setStartPoint(sha).call();

            Map<String, Object> result = new HashMap<>();
            result.put("ref", "refs/heads/" + branchName);
            // ... minimal return
            return result;
        } catch (IOException | GitAPIException e) {
            throw new RuntimeException("Failed to create branch: " + e.getMessage());
        }
    }
}
