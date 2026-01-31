package com.gitten.service;

import com.gitten.model.Repository;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.lib.Constants;
import org.eclipse.jgit.lib.Ref;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class LocalGitService {

    public List<Repository> scanLocalRepositories(String path) {
        List<Repository> repositories = new ArrayList<>();
        File rootDir = new File(path);

        if (!rootDir.exists() || !rootDir.isDirectory()) {
            return repositories;
        }

        File[] files = rootDir.listFiles();
        if (files == null) return repositories;

        for (File file : files) {
            if (file.isDirectory()) {
                // Check if it's a git repo
                File gitDir = new File(file, ".git");
                if (gitDir.exists() && gitDir.isDirectory()) {
                    Repository repo = new Repository();
                    repo.setName(file.getName());
                    repo.setDescription("Local Repository at " + file.getAbsolutePath());
                    repo.setHtmlUrl("file://" + file.getAbsolutePath());
                    repo.setVisibility("local");
                    repo.setLanguage(detectLanguage(file));
                    
                    // Basic stats dummy data for local repos or use JGit to fetch
                    repo.setStargazersCount(0);
                    repo.setForksCount(0);
                    
                    repositories.add(repo);
                }
            }
        }
        return repositories;
    }

    private String detectLanguage(File dir) {
        // Simple heuristic: check for common extensions
        // In a real app, we'd scan file contents or use a library
        File[] files = dir.listFiles();
        if (files == null) return "Unknown";
        for (File f : files) {
            if (f.getName().endsWith(".java")) return "Java";
            if (f.getName().endsWith(".ts") || f.getName().endsWith(".tsx")) return "TypeScript";
            if (f.getName().endsWith(".js")) return "JavaScript";
            if (f.getName().endsWith(".py")) return "Python";
            if (f.getName().endsWith(".go")) return "Go";
            if (f.getName().endsWith(".rs")) return "Rust";
        }
        return "Unknown";
    }
}
