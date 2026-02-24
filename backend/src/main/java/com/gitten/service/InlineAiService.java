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

@Service
public class InlineAiService {

    private static final Logger log = LoggerFactory.getLogger(InlineAiService.class);

    private final RestClient.Builder restClientBuilder;

    /**
     * In-memory conversation history keyed by "username:sessionId".
     * Each value is a list of message maps (role + content) sent to OpenAI.
     */
    private final ConcurrentHashMap<String, List<Map<String, String>>> conversationStore = new ConcurrentHashMap<>();

    @Value("${openai.api.key:placeholder_key}")
    private String openAiApiKey;

    public InlineAiService(RestClient.Builder restClientBuilder) {
        this.restClientBuilder = restClientBuilder;
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
            userMessage = "Explain this code/commit.";
        }
        history.add(Map.of("role", "user", "content", userMessage));

        // Trim history if too long (keep system + last 20 messages)
        if (history.size() > 21) {
            Map<String, String> systemMsg = history.get(0);
            List<Map<String, String>> trimmed = new ArrayList<>();
            trimmed.add(systemMsg);
            trimmed.addAll(history.subList(history.size() - 20, history.size()));
            history.clear();
            history.addAll(trimmed);
        }

        // Call OpenAI
        Map<String, Object> requestBody = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", new ArrayList<>(history),
                "temperature", 0.7,
                "max_tokens", 1024
        );

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
                    String content = (String) message.get("content");

                    // Store assistant response in history
                    history.add(Map.of("role", "assistant", "content", content));

                    return new InlineAiResponse(content, sessionId);
                }
            }
        } catch (Exception e) {
            log.error("Error calling OpenAI for inline AI chat", e);
            return new InlineAiResponse(
                    "I'm sorry, I'm having trouble connecting right now. Please check the API key and try again.",
                    sessionId
            );
        }

        return new InlineAiResponse("No response from AI.", sessionId);
    }

    /**
     * Clears conversation history for a given session.
     */
    public void clearSession(String username, String sessionId) {
        conversationStore.remove(username + ":" + sessionId);
    }

    private String buildSystemPrompt(String selectedText, String commitId) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an AI code review assistant.\n");

        if (selectedText != null && !selectedText.isBlank()) {
            sb.append("Here is the selected commit/code:\n");
            sb.append("---\n");
            // Limit selected text to avoid token overflow
            if (selectedText.length() > 3000) {
                sb.append(selectedText, 0, 3000).append("...(truncated)");
            } else {
                sb.append(selectedText);
            }
            sb.append("\n---\n");
        }

        if (commitId != null && !commitId.isBlank()) {
            sb.append("Commit ID: ").append(commitId).append("\n");
        }

        sb.append("\nAnswer clearly and technically. ");
        sb.append("If asked to explain, provide concise explanations. ");
        sb.append("If asked to improve, suggest concrete code improvements. ");
        sb.append("If asked about bugs, identify potential issues and fixes.");

        return sb.toString();
    }
}
