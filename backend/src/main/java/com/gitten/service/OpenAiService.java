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

        String apiUrl = "https://api.openai.com/v1/chat/completions";
        String modelName = "gpt-3.5-turbo";
        
        String cleanKey = openAiApiKey != null ? openAiApiKey.replaceAll("^\"|\"$", "").replaceAll("^'|'$", "").trim() : null;
        
        if (cleanKey != null && cleanKey.startsWith("nvapi-")) {
            apiUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
            modelName = "meta/llama-3.1-8b-instruct";
        }

        // Call OpenAI or Nvidia based on key
        Map<String, Object> requestBody = Map.of(
                "model", modelName,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)));

        // Note: Using a new RestClient here because the main one is configured for GitHub
        RestClient openAiClient = restClientBuilder.build();

        try {
            Map response = openAiClient.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + cleanKey)
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

    @Override
    public String generateRepositoryInsights(String username, String repoName) {
        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("You are an expert AI software architect. Analyze the provided repository information and respond ONLY with a valid JSON object. Do NOT wrap it in Markdown or code blocks.\n");
        contextBuilder.append("The JSON MUST have EXACTLY these keys: \n");
        contextBuilder.append("- \"summary\" (string): A crisp 2-3 sentence overview of what the repo does.\n");
        contextBuilder.append("- \"healthScore\" (integer 0-100): Evaluate the repo based on standard practices.\n");
        contextBuilder.append("- \"healthDetails\" (string): 1-2 sentences explaining why it got this score.\n");
        contextBuilder.append("- \"collaborationAnalysis\" (string): A short note on collaboration/activity (e.g., 'Solo project, mostly authored by X').\n");
        contextBuilder.append("- \"securityScore\" (integer 0-100): Quick theoretical security score based on language and standard best practices.\n\n");
        
        contextBuilder.append("Repository Name: ").append(repoName).append("\n");

        if (repoName != null && !repoName.isEmpty()) {
            try {
                User user = userRepository.findByUsername(username).orElse(null);
                if (user != null && user.getAccessToken() != null) {
                    String[] parts = repoName.split("/");
                    if (parts.length == 2) {
                        Map<String, Object> readme = gitHubService.getFileContent(parts[0], parts[1], "README.md", user.getAccessToken());
                        if (readme != null && readme.containsKey("content")) {
                            String encodedContent = (String) readme.get("content");
                            String cleanEncoded = encodedContent.replaceAll("\\s", "");
                            byte[] decodedBytes = Base64.getDecoder().decode(cleanEncoded);
                            String decodedContent = new String(decodedBytes, StandardCharsets.UTF_8);
                            if (decodedContent.length() > 3000) {
                                decodedContent = decodedContent.substring(0, 3000) + "...(truncated)";
                            }
                            contextBuilder.append("README.md Content:\n").append(decodedContent).append("\n");
                        } else {
                            contextBuilder.append("README.md: Not found or empty.\n");
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Could not fetch README for insights: " + e.getMessage());
                contextBuilder.append("README.md: Unable to access at this time.\n");
            }
        }

        String apiUrl = "https://api.openai.com/v1/chat/completions";
        String modelName = "gpt-3.5-turbo";
        
        String cleanKey = openAiApiKey != null ? openAiApiKey.replaceAll("^\"|\"$", "").replaceAll("^'|'$", "").trim() : null;
        if (cleanKey != null && cleanKey.startsWith("nvapi-")) {
            apiUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
            modelName = "meta/llama-3.1-8b-instruct";
        }

        Map<String, Object> requestBody = Map.of(
                "model", modelName,
                "temperature", 0.3,
                "messages", List.of(
                        Map.of("role", "system", "content", contextBuilder.toString()),
                        Map.of("role", "user", "content", "Please generate the JSON insights for this repository.")
                )
        );

        RestClient openAiClient = restClientBuilder.build();

        try {
            Map response = openAiClient.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + cleanKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("choices")) {
                List choices = (List) response.get("choices");
                if (!choices.isEmpty()) {
                    Map choice = (Map) choices.get(0);
                    Map message = (Map) choice.get("message");
                    String content = (String) message.get("content");
                    
                    // Cleanup any potential markdown block wrappers the LLM might have ignored system prompt
                    if (content.startsWith("```json")) {
                        content = content.substring(7);
                    } else if (content.startsWith("```")) {
                        content = content.substring(3);
                    }
                    if (content.endsWith("```")) {
                        content = content.substring(0, content.length() - 3);
                    }
                    return content.trim();
                }
            }
        } catch (Exception e) {
            log.error("Error generating repository insights", e);
            // Return fallback JSON
            return "{\"summary\": \"Analysis currently unavailable.\", \"healthScore\": 0, \"healthDetails\": \"Error communicating with AI service.\", \"collaborationAnalysis\": \"N/A\", \"securityScore\": 0}";
        }

        return "{\"summary\": \"No response from AI.\", \"healthScore\": 0, \"healthDetails\": \"N/A\", \"collaborationAnalysis\": \"N/A\", \"securityScore\": 0}";
    }
}
