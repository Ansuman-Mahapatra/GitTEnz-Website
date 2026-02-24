package com.gitten.controller;

import com.gitten.dto.InlineAiRequest;
import com.gitten.dto.InlineAiResponse;
import com.gitten.service.InlineAiService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class InlineAiController {

    private final InlineAiService inlineAiService;

    public InlineAiController(InlineAiService inlineAiService) {
        this.inlineAiService = inlineAiService;
    }

    @PostMapping("/chat")
    public InlineAiResponse chat(
            org.springframework.security.core.Authentication authentication,
            @RequestBody InlineAiRequest request) {
        String username = authentication.getName();
        return inlineAiService.chat(username, request);
    }

    @PostMapping("/chat/clear")
    public Map<String, String> clearSession(
            org.springframework.security.core.Authentication authentication,
            @RequestBody Map<String, String> payload) {
        String username = authentication.getName();
        String sessionId = payload.get("sessionId");
        if (sessionId != null) {
            inlineAiService.clearSession(username, sessionId);
        }
        return Map.of("status", "cleared");
    }
}
