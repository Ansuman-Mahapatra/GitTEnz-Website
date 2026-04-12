package com.gitten.service;

import com.gitten.dto.InlineAiRequest;
import com.gitten.dto.InlineAiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Objects;
import com.gitten.repository.UserRepository;
import java.util.Optional;

@Service
public class InlineAiService {

    private static final Logger log = LoggerFactory.getLogger(InlineAiService.class);

    private final RestClient.Builder restClientBuilder;
    private final UserRepository userRepository;

    /**
     * In-memory conversation history keyed by "username:sessionId".
     * Each value is a list of message maps (role + content) sent to OpenAI.
     */
    private final ConcurrentHashMap<String, List<Map<String, String>>> conversationStore = new ConcurrentHashMap<>();

    @Value("${openai.api.key}")
    private String openAiApiKey;

    public InlineAiService(RestClient.Builder restClientBuilder, UserRepository userRepository) {
        this.restClientBuilder = restClientBuilder;
        this.userRepository = userRepository;
    }

    private String getEffectiveKey(String username) {
        if (username != null) {
            Optional<com.gitten.model.User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent() && userOpt.get().getAiApiKey() != null && !userOpt.get().getAiApiKey().isBlank()) {
                return userOpt.get().getAiApiKey().trim();
            }
        }
        return openAiApiKey != null ? openAiApiKey.trim() : null;
    }

    public InlineAiResponse chat(String username, InlineAiRequest request) {
        // Generate or reuse session ID
        String sessionId = request.getSessionId();
        if (sessionId == null || sessionId.isBlank()) {
            sessionId = UUID.randomUUID().toString();
        }

        String historyKey = username + ":" + sessionId;

        // Build the system prompt with selected text context
        String systemPrompt = buildSystemPrompt(request.getSelectedText(), request.getCommitId());

        // Get or create conversation history
        List<Map<String, String>> history = conversationStore.computeIfAbsent(historyKey, k -> {
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            return messages;
        });

        // Append user message
        String userMessage = request.getUserMessage();
        if (userMessage == null || userMessage.isBlank()) {
            userMessage = "Explain this code block.";
        }
        history.add(Map.of("role", "user", "content", userMessage));

        // Trim history if too long (keep system + last 10 messages for better context)
        if (history.size() > 11) {
            Map<String, String> systemMsg = history.get(0);
            List<Map<String, String>> trimmed = new ArrayList<>();
            trimmed.add(systemMsg);
            trimmed.addAll(history.subList(history.size() - 10, history.size()));
            history.clear();
            history.addAll(trimmed);
        }

        String effectiveKey = getEffectiveKey(username);
        if (effectiveKey == null || effectiveKey.isBlank()) {
            return new InlineAiResponse("No OpenAI API Key found. Please configure it in Settings -> Developer.",
                    sessionId);
        }

        String apiUrl = "https://api.openai.com/v1/chat/completions";
        String modelName = "gpt-4o-mini";
        
        if (effectiveKey.startsWith("nvapi-")) {
            apiUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
            modelName = "meta/llama-3.1-8b-instruct";
        }

        // Call OpenAI or Nvidia based on key
        Map<String, Object> requestBody = Map.of(
                "model", modelName,
                "messages", new ArrayList<>(history),
                "temperature", 0.7,
                "max_tokens", 2048);

        RestClient openAiClient = restClientBuilder.build();

        try {
            Map response = openAiClient.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + effectiveKey)
                    .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                    .body(Objects.requireNonNull(requestBody))
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("choices")) {
                List choices = (List) response.get("choices");
                if (!choices.isEmpty()) {
                    Map choice = (Map) choices.get(0);
                    Map message = (Map) choice.get("message");
                    String content = (String) message.get("content");

                    // Store assistant response in history
                    history.add(Map.of("role", "assistant", "content", content));

                    return new InlineAiResponse(content, sessionId);
                }
            }
        } catch (Exception e) {
            log.error("OpenAI API call failed for user {}: {}", username, e.getMessage());
            String fallbackMessage = "I encountered an issue connecting to OpenAI. ";
            if (e.getMessage() != null
                    && (e.getMessage().contains("401") || e.getMessage().contains("invalid_api_key"))) {
                fallbackMessage += "The API key seems to be invalid or expired. Please check your settings.";
            } else if (e.getMessage() != null && e.getMessage().contains("429")) {
                fallbackMessage += "Quota limit reached. If you're using a shared key, consider providing your own in Settings -> Developer.";
            } else {
                fallbackMessage += "Details: "
                        + (e.getMessage() != null ? e.getMessage() : "Unknown connection error.");
            }
            return new InlineAiResponse(fallbackMessage, sessionId);
        }

        return new InlineAiResponse("The AI service returned an empty response. Please try again.", sessionId);
    }

    /**
     * Clears conversation history for a given session.
     */
    public void clearSession(String username, String sessionId) {
        conversationStore.remove(username + ":" + sessionId);
    }

    private String buildSystemPrompt(String selectedText, String commitId) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are 'GitTEnz AI', a senior engineering assistant specialized in code analysis.\n\n");
        sb.append(
                "Your goal is to provide deep, technical, and accurate explanations or suggestions based on the provided code block.\n");
        sb.append("Use Markdown for formatting, especially for code snippets, bold text, and lists.\n\n");

        if (selectedText != null && !selectedText.isBlank()) {
            sb.append("### Context (Selected Code):\n");
            sb.append("```\n");
            // Limit selected text to avoid token overflow but allow more for gpt-4o-mini
            if (selectedText.length() > 6000) {
                sb.append(selectedText, 0, 6000).append("\n...(content truncated for context length)");
            } else {
                sb.append(selectedText);
            }
            sb.append("\n```\n\n");
        }

        if (commitId != null && !commitId.isBlank()) {
            sb.append("Current Reference Commit: ").append(commitId).append("\n\n");
        }

        sb.append("Guidelines:\n");
        sb.append("- Explain logic clearly and concisely.\n");
        sb.append("- Identify potential edge cases or bugs if visible.\n");
        sb.append("- Suggest modern alternatives (e.g., ES6+, Java 17+ features) when relevant.\n");
        sb.append("- Always respond in a professional and helpful tone.");

        return sb.toString();
    }
}
