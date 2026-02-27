package com.gitten.config;

import com.gitten.model.User;
import com.gitten.repository.UserRepository;
import com.gitten.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

        private final JwtService jwtService;
        private final UserRepository userRepository;
        private final OAuth2AuthorizedClientService authorizedClientService;

        // Manual constructor removed in favor of @RequiredArgsConstructor

        @org.springframework.beans.factory.annotation.Value("${frontend.url:https://gittenz.vercel.app}")
        private String frontendUrl;

        @Override
        public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                        Authentication authentication) throws IOException, ServletException {
                OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
                OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;

                OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                                authToken.getAuthorizedClientRegistrationId(),
                                authToken.getName());

                String accessToken;
                if (client != null && client.getAccessToken() != null) {
                        accessToken = client.getAccessToken().getTokenValue();
                } else {
                        log.error("AuthorizedClient is null!");
                        accessToken = "";
                }

                Object emailObj = oAuth2User.getAttribute("email");
                String email = emailObj != null ? String.valueOf(emailObj) : null;

                Object loginObj = oAuth2User.getAttributes().get("login");
                String username = (loginObj != null) ? String.valueOf(loginObj) : "unknown";

                // Save or Update User
                java.util.Optional<User> userOpt = java.util.Optional.empty();
                if (email != null && !email.isBlank()) {
                        userOpt = userRepository.findByEmail(email);
                }
                if (userOpt.isEmpty()) {
                        userOpt = userRepository.findByUsername(username);
                }

                if (userOpt.isEmpty()) {
                        // Not registered. Return error.
                        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                                        .queryParam("error",
                                                        "GitHub login requires an existing account. Please sign up first and ensure your GitHub email or username matches.")
                                        .build().toUriString();
                        getRedirectStrategy().sendRedirect(request, response, targetUrl);
                        return;
                }

                User user = userOpt.get();

                Object nameObj = oAuth2User.getAttribute("name");
                user.setName(nameObj != null ? String.valueOf(nameObj) : null);

                user.setEmail(email != null ? email : null);

                Object avatarObj = oAuth2User.getAttribute("avatar_url");
                user.setAvatarUrl(avatarObj != null ? String.valueOf(avatarObj) : null);

                // Safely convert Integer id to String using explicit Object cast first
                Object idObj = oAuth2User.getAttribute("id");
                user.setGithubId(idObj != null ? String.valueOf(idObj) : null);

                user.setAccessToken(accessToken);
                // Record time of successful GitHub verification for 72h re-auth logic
                user.setLastGithubVerifiedAt(java.time.LocalDateTime.now());

                userRepository.save(user);

                String token = jwtService.generateToken(new java.util.HashMap<>(), user.getUsername());

                String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/success")
                                .queryParam("token", token)
                                .build().toUriString();

                getRedirectStrategy().sendRedirect(request, response, targetUrl);
        }
}
