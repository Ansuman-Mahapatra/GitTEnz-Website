package com.gitten.service;

public interface AiService {
    String chat(String username, String userMessage, String repoName, String filePath);
    // Overload for backward compatibility if needed, or just update callers
}
