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

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OpenAiService implements AiService {

    private static final Logger log = LoggerFactory.getLogger(OpenAiService.class);

    private final RepositoryService repositoryService;
    private final RestClient.Builder restClientBuilder;

    public OpenAiService(RepositoryService repositoryService, RestClient.Builder restClientBuilder) {
        this.repositoryService = repositoryService;
        this.restClientBuilder = restClientBuilder;
    }

    @Value("${openai.api.key:placeholder_key}")
    private String openAiApiKey;

    @Override
    public String chat(String username, String userMessage) {
        // Build Context
        List<Repository> repos = repositoryService.getRepositoriesByUsername(username);
        String repoContext = repos.stream()
                .map(r -> r.getName() + " (" + r.getLanguage() + ")")
                .collect(Collectors.joining(", "));

        String systemPrompt = "You are GitTEn AI, a helpful assistant for GitHub repositories. " +
                "The user has the following repositories: " + repoContext + ". " +
                "Answer questions about these repositories or general git questions.";

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
