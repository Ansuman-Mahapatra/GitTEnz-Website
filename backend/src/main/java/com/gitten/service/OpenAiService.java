package com.gitten.service;

import com.gitten.model.Repository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.gitten.model.User;
import com.gitten.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAiService implements AiService {

    private final RepositoryService repositoryService;
    private final RestClient.Builder restClientBuilder;
    private final UserRepository userRepository;
    private final GitHubService gitHubService;

    @Value("${openai.api.key:placeholder_key}")
    private String openAiApiKey;

    @Override
    public String chat(String username, String userMessage, String repoName, String filePath) {
        // Build generic context
        List<Repository> repos = repositoryService.getRepositoriesByUsername(username);
        String repoList = repos.stream()
                .map(r -> r.getName() + " (" + r.getLanguage() + ")")
                .collect(Collectors.joining(", "));

        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("You are GitTEn AI, a helpful assistant for GitHub repositories. ");
        contextBuilder.append("The user has the following repositories: ").append(repoList).append(". ");

        // Fetch detailed context if repoName provided
        if (repoName != null && !repoName.isEmpty()) {
            contextBuilder.append("The user is currently viewing repository: ").append(repoName).append(". ");

            // Fetch README content
            try {
                User user = userRepository.findByUsername(username).orElse(null);
                if (user != null && user.getAccessToken() != null) {
                    String[] parts = repoName.split("/");
                    if (parts.length == 2) {
                        Map<String, Object> readme = gitHubService.getFileContent(parts[0], parts[1], "README.md",
                                user.getAccessToken());
                        if (readme != null && readme.containsKey("content")) {
                            String encodedContent = (String) readme.get("content");
                            // Sanitize base64 string (remove newlines)
                            String cleanEncoded = encodedContent.replaceAll("\\s", "");
                            byte[] decodedBytes = Base64.getDecoder().decode(cleanEncoded);
                            String decodedContent = new String(decodedBytes, StandardCharsets.UTF_8);
                            // Limit README size to avoid token limits
                            if (decodedContent.length() > 2000) {
                                decodedContent = decodedContent.substring(0, 2000) + "...(truncated)";
                            }
                            contextBuilder.append("Here is the README.md content of the current repository:\n")
                                    .append(decodedContent).append("\n");
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Could not fetch README for context: " + e.getMessage());
            }
        }

        contextBuilder.append(
                "Answer questions specifically about the repository content if provided, or general git questions.");

        String systemPrompt = contextBuilder.toString();

        // Call OpenAI
        Map<String, Object> requestBody = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)));

        // Note: Using a new RestClient here because the main one is configured for
        // GitHub
        RestClient openAiClient = restClientBuilder.build();

        try {
            Map response = openAiClient.post()
                    .uri("https://api.openai.com/v1/chat/completions")
                    .header("Authorization", "Bearer " + openAiApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("choices")) {
                List choices = (List) response.get("choices");
                if (!choices.isEmpty()) {
                    Map choice = (Map) choices.get(0);
                    Map message = (Map) choice.get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            log.error("Error calling OpenAI", e);
            return "I'm sorry, I'm having trouble connecting to my brain right now. Please check the API Key.";
        }

        return "No response from AI.";
    }
}
