package com.gitten.controller;

import com.gitten.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")

public class ChatController {

    private final AiService aiService;

    public ChatController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping
    public Map<String, String> chat(org.springframework.security.core.Authentication authentication,
            @RequestBody Map<String, String> payload) {
        String username = authentication.getName();
        String message = payload.get("message");
        String repoName = payload.get("repoName");
        String filePath = payload.get("filePath");
        String response = aiService.chat(username, message, repoName, filePath);
        return Map.of("response", response);
    }
}
