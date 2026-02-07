package com.gitten.controller;

import com.gitten.model.SystemConfig;
import com.gitten.repository.SystemConfigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final SystemConfigRepository systemConfigRepository;

    public PublicController(SystemConfigRepository systemConfigRepository) {
        this.systemConfigRepository = systemConfigRepository;
    }

    @GetMapping("/privacy-policy")
    public ResponseEntity<?> getPrivacyPolicy() {
        String content = systemConfigRepository.findByKey("privacy_policy")
                .map(SystemConfig::getValue).orElse("Default Privacy Policy");
        return ResponseEntity.ok(Map.of("content", content));
    }

    @GetMapping("/terms-of-service")
    public ResponseEntity<?> getTermsOfService() {
        String content = systemConfigRepository.findByKey("terms_of_service")
                .map(SystemConfig::getValue).orElse("Default Terms of Service");
        return ResponseEntity.ok(Map.of("content", content));
    }
}
