package com.gitten.controller;

import com.gitten.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final AiService aiService;

    public ChatController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping
    public Map<String, String> chat(@AuthenticationPrincipal OAuth2User oauth2User,
            @RequestBody Map<String, String> payload) {
        String username = oauth2User.getAttribute("login");
        String message = payload.get("message");
        String response = aiService.chat(username, message);
        return Map.of("response", response);
    }
}
