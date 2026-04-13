package com.gitten.service;

public interface AiService {
    String chat(String username, String userMessage, String repoName, String filePath);
    String generateRepositoryInsights(String username, String repoName);
}
