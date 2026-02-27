package com.gitten.config;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Collections;
import java.util.Map;

@Configuration
@EnableWebSecurity

@RequiredArgsConstructor
public class SecurityConfig {

        private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
        private final JwtAuthenticationFilter jwtAuthFilter;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/", "/login**", "/error", "/api/public/**",
                                                                "/api/auth/**")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(
                                                                org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED))
                                .oauth2Login(oauth2 -> oauth2
                                                .successHandler(oAuth2LoginSuccessHandler))
                                .exceptionHandling(exceptions -> exceptions
                                                .defaultAuthenticationEntryPointFor(
                                                                new org.springframework.security.web.authentication.HttpStatusEntryPoint(
                                                                                org.springframework.http.HttpStatus.UNAUTHORIZED),
                                                                new org.springframework.security.web.util.matcher.AntPathRequestMatcher(
                                                                                "/api/**")))
                                .addFilterBefore(jwtAuthFilter,
                                                org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @org.springframework.beans.factory.annotation.Value("${frontend.url:http://localhost:5180}")
        private String frontendUrl;

        @Bean
        public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
                org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
                // Dynamically add the frontend URL from environment variable
                java.util.List<String> allowedOrigins = new java.util.ArrayList<>();
                allowedOrigins.add("http://localhost:5180");
                allowedOrigins.add("http://localhost:5173");
                allowedOrigins.add("https://gittenz.netlify.app");
                allowedOrigins.add("https://gittenz.vercel.app");
                if (frontendUrl != null && !frontendUrl.isEmpty()) {
                        allowedOrigins.add(frontendUrl);
                }
                configuration.setAllowedOrigins(allowedOrigins);
                configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type"));
                configuration.setAllowCredentials(true);
                org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
