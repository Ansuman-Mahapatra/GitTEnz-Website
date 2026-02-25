package com.gitten.config;

import com.gitten.model.User;
import com.gitten.repository.UserRepository;
import com.gitten.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        try {
            username = jwtService.extractUsername(jwt);
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                if (jwtService.isTokenValid(jwt, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    // Update lastActiveAt for authenticated users
                    updateUserActivity(username);
                }
            }
        } catch (Exception e) {
            // Token invalid or expired
            log.error("JWT Authentication Error: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private void updateUserActivity(String username) {
        try {
            userRepository.findByUsername(username).ifPresent(user -> {
                // Only update if last activity was more than 1 minute ago to reduce DB writes
                if (user.getLastActiveAt() == null ||
                        java.time.Duration.between(user.getLastActiveAt(), java.time.LocalDateTime.now())
                                .toMinutes() >= 1) {
                    user.setLastActiveAt(java.time.LocalDateTime.now());
                    userRepository.save(user);
                }
            });
        } catch (Exception e) {
            // Log but don't fail the request if activity update fails
            log.error("Failed to update user activity: {}", e.getMessage());
        }
    }
}
