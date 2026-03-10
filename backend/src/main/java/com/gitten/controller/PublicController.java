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

    @org.springframework.beans.factory.annotation.Value("${developer.linkedin.url:https://www.linkedin.com/in/ansuman197463/}")
    private String developerLinkedinUrl;

    @org.springframework.beans.factory.annotation.Value("${developer.github.url:https://github.com/Ansuman-Mahapatra}")
    private String developerGithubUrl;

    @org.springframework.beans.factory.annotation.Value("${developer.email:ansuman197463@gmail.com}")
    private String developerEmail;

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

    @GetMapping("/developer-info")
    public ResponseEntity<?> getDeveloperInfo() {
        return ResponseEntity.ok(Map.of(
                "linkedin", developerLinkedinUrl,
                "github", developerGithubUrl,
                "email", developerEmail));
    }
}
