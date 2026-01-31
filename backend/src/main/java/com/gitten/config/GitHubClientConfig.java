package com.gitten.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class GitHubClientConfig {

    @Value("${github.api.url:https://api.github.com}")
    private String githubApiUrl;

    @Bean
    public RestClient gitHubRestClient() {
        return RestClient.builder()
                .baseUrl(githubApiUrl)
                .defaultHeader("Accept", "application/vnd.github.v3+json")
                .build();
    }
}
