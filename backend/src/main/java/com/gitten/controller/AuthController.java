package com.gitten.controller;

import com.gitten.dto.AuthResponse;
import com.gitten.dto.LoginRequest;
import com.gitten.dto.SignupRequest;
import com.gitten.model.User;
import com.gitten.repository.UserRepository;
import com.gitten.service.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.HashMap;
import java.security.SecureRandom;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final com.gitten.service.EmailService emailService;
    // Simple encoder for now. In prod, define a Bean.
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @org.springframework.beans.factory.annotation.Value("${frontend.url:http://localhost:5180}")
    private String frontendUrl;

    public AuthController(UserRepository userRepository, JwtService jwtService,
            com.gitten.service.EmailService emailService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        // Validate password strength first
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body("Error: Password must be at least 8 characters long");
        }
        if (!request.getPassword().matches(".*[A-Za-z].*") || !request.getPassword().matches(".*[0-9].*")) {
            return ResponseEntity.badRequest().body("Error: Password must contain both letters and numbers");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAvatarUrl("https://ui-avatars.com/api/?name=" + request.getName());
        user.setOnboardingCompleted(true);
        user.setEmailVerified(true);

        userRepository.save(user);

        return ResponseEntity.ok(java.util.Map.of("message", "Signup successful!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getIdentifier());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(request.getIdentifier());
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: User not found");
        }

        User user = userOpt.get();

        if (!user.isOnboardingCompleted()) {
            return ResponseEntity.status(401)
                    .body("Error: Email not verified. Please complete signup verification first.");
        }

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Error: Invalid credentials");
        }

        // Admin OTP Check
        if ("ADMIN".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getUsername())) {
            // Use SecureRandom for cryptographically secure OTP generation
            SecureRandom secureRandom = new SecureRandom();
            String otp = String.format("%06d", secureRandom.nextInt(1000000));
            user.setOtp(otp);
            user.setOtpExpiry(java.time.Instant.now().plus(5, java.time.temporal.ChronoUnit.MINUTES));
            userRepository.save(user);

            // Send OTP via Email
            emailService.sendOtp(user.getEmail(), otp);
            System.out.println(">>> OTP SENT TO EMAIL: " + user.getEmail());

            // Return response indicating OTP required
            return ResponseEntity.ok(new AuthResponse(null, user, true));
        }

        // Rolling GitHub Verification: If user returns within 3 days of last activity,
        // keep them verified. Using UTC comparison for environment consistency.
        java.time.Instant now = java.time.Instant.now();
        java.time.Instant threeDaysAgo = now.minus(3, java.time.temporal.ChronoUnit.DAYS);

        if (user.getGithubId() != null) {
            // Check if they were active recently OR if they were verified recently
            boolean activeRecently = user.getLastActiveAt() != null && user.getLastActiveAt().isAfter(threeDaysAgo);
            boolean verifiedRecently = user.getLastGithubVerifiedAt() != null
                    && user.getLastGithubVerifiedAt().isAfter(threeDaysAgo);

            if (activeRecently || verifiedRecently) {
                user.setLastGithubVerifiedAt(now);
                log.info("[AUTH] Extended GitHub verification for user: {}", user.getUsername());
            }
        }

        user.setLastActiveAt(now);
        userRepository.save(user);

        String token = jwtService.generateToken(new HashMap<>(), user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, user, false));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody com.gitten.dto.OtpVerificationRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getIdentifier());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(request.getIdentifier());
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: User not found");
        }

        User user = userOpt.get();

        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            return ResponseEntity.badRequest().body("Error: Invalid OTP");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(java.time.Instant.now())) {
            return ResponseEntity.badRequest().body("Error: OTP Expired");
        }

        // Clear OTP
        user.setOtp(null);
        user.setOtpExpiry(null);

        // Rolling GitHub Verification: If user returns within 3 days of last activity,
        // keep them verified
        java.time.Instant now = java.time.Instant.now();
        java.time.Instant threeDaysAgo = now.minus(3, java.time.temporal.ChronoUnit.DAYS);

        if (user.getGithubId() != null) {
            boolean activeRecently = user.getLastActiveAt() != null && user.getLastActiveAt().isAfter(threeDaysAgo);
            boolean verifiedRecently = user.getLastGithubVerifiedAt() != null
                    && user.getLastGithubVerifiedAt().isAfter(threeDaysAgo);

            if (activeRecently || verifiedRecently) {
                user.setLastGithubVerifiedAt(now);
            }
        }

        user.setLastActiveAt(now);
        userRepository.save(user);

        String token = jwtService.generateToken(new HashMap<>(), user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, user, false));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        String email = request.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty())
            return ResponseEntity.badRequest().body("User not found with this email");
        User user = userOpt.get();

        String token = java.util.UUID.randomUUID().toString();
        user.setEmailVerificationToken(token);
        user.setEmailVerificationExpiry(java.time.Instant.now().plus(15, java.time.temporal.ChronoUnit.MINUTES));
        userRepository.save(user);

        String origin = httpRequest.getHeader("Origin");
        String baseUrl = frontendUrl; // Default fallback from application.yml / env vars
        if (origin != null && !origin.isEmpty()) {
            baseUrl = origin; // Prioritize the exact URL that requested the reset
        } else {
            String referer = httpRequest.getHeader("Referer");
            if (referer != null && !referer.isEmpty()) {
                baseUrl = referer.endsWith("/") ? referer.substring(0, referer.length() - 1) : referer;
            }
        }

        String resetLink = baseUrl + "/reset-password?token=" + token + "&email=" + email;
        boolean emailSent = emailService.sendEmail(email, "Reset Your Password - GitTEnz",
                "Hello " + user.getUsername() + ",\n\nClick the link below to reset your password:\n\n" + resetLink
                        + "\n\nThis link expires in 15 minutes.\n\nRegards,\nGitTEnz Team");

        if (!emailSent) {
            // Don't crash the app — SMTP may be blocked in production (e.g. Render free
            // tier).
            // Log the failure and return graceful success so the frontend doesn't show a
            // server error.
            // Developer can check server logs for the [EMAIL FAILURE] entries for
            // diagnosis.
            log.warn(
                    "[FORGOT PASSWORD] Email delivery failed for {}. Reset link was generated but email was not sent. Check [EMAIL FAILURE] logs.",
                    email);
        }

        return ResponseEntity.ok(java.util.Map.of("message", "Reset password link sent to your email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty())
            return ResponseEntity.badRequest().body("Error: User not found");
        User user = userOpt.get();

        if (user.getEmailVerificationToken() == null || !user.getEmailVerificationToken().equals(token)) {
            return ResponseEntity.badRequest().body("Error: Invalid or expired token");
        }
        if (user.getEmailVerificationExpiry() == null
                || user.getEmailVerificationExpiry().isBefore(java.time.Instant.now())) {
            return ResponseEntity.badRequest().body("Error: Token expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(java.util.Map.of("message", "Password reset successfully"));
    }
}
