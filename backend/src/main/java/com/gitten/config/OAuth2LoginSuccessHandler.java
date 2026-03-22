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
                        // First-time GitHub login — auto-create account
                        log.info("[GITHUB OAUTH] New user via GitHub: username={}, email={}", username, email);

                        // Ensure username is unique — append suffix if taken
                        String baseUsername = username;
                        String finalUsername = baseUsername;
                        int suffix = 1;
                        while (userRepository.findByUsername(finalUsername).isPresent()) {
                                finalUsername = baseUsername + suffix++;
                        }

                        Object nameObj2 = oAuth2User.getAttribute("name");
                        Object avatarObj2 = oAuth2User.getAttribute("avatar_url");
                        Object idObj2 = oAuth2User.getAttribute("id");

                        User newUser = new User();
                        newUser.setUsername(finalUsername);
                        newUser.setEmail(email);
                        newUser.setName(nameObj2 != null ? String.valueOf(nameObj2) : finalUsername);
                        newUser.setAvatarUrl(avatarObj2 != null ? String.valueOf(avatarObj2) : null);
                        newUser.setGithubId(idObj2 != null ? String.valueOf(idObj2) : null);
                        newUser.setAccessToken(accessToken);
                        newUser.setOnboardingCompleted(true);
                        newUser.setEmailVerified(false); // admin will verify in background
                        newUser.setLastGithubVerifiedAt(java.time.Instant.now());
                        userRepository.save(newUser);
                        userOpt = java.util.Optional.of(newUser);
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
                user.setLastGithubVerifiedAt(java.time.Instant.now());
                // Also set lastActiveAt to ensure rolling verification works on next email
                // login
                user.setLastActiveAt(java.time.Instant.now());

                userRepository.save(user);

                String token = jwtService.generateToken(new java.util.HashMap<>(), user.getUsername());

                // Determine if this came from the desktop app
                String redirectBase = frontendUrl; // always use the registered website URL
                boolean isDesktopSource = false;
                String stateParam = request.getParameter("state");
                if (stateParam != null) {
                        try {
                                String decoded = java.net.URLDecoder.decode(stateParam, "UTF-8");
                                if (decoded.contains("source=desktop")) {
                                        isDesktopSource = true;
                                }
                        } catch (Exception e) {
                                log.warn("[OAUTH] Failed to parse state param: {}", e.getMessage());
                        }
                }

                // Build redirect URL — always goes to the vercel website (registered callback)
                // but adds source=desktop so the website knows to show "close this tab"
                UriComponentsBuilder uriBuilder = UriComponentsBuilder
                                .fromUriString(redirectBase + "/auth/success")
                                .queryParam("token", token);
                if (isDesktopSource) {
                        uriBuilder.queryParam("source", "desktop");
                }
                String targetUrl = uriBuilder.build().toUriString();

                getRedirectStrategy().sendRedirect(request, response, targetUrl);
        }
}
