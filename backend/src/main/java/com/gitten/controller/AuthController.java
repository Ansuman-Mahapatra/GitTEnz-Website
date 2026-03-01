package com.gitten.controller;

import com.gitten.dto.AuthResponse;
import com.gitten.dto.LoginRequest;
import com.gitten.dto.SignupRequest;
import com.gitten.model.User;
import com.gitten.repository.UserRepository;
import com.gitten.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // We need a password encoder
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.HashMap;
import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;

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

    private static class OtpData {
        String otp;
        LocalDateTime expiry;

        OtpData(String otp, LocalDateTime expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }
    }

    private final ConcurrentHashMap<String, OtpData> signupOtpStore = new ConcurrentHashMap<>();

    @PostMapping("/send-signup-otp")
    public ResponseEntity<?> sendSignupOtp(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty())
            return ResponseEntity.badRequest().body("Error: Email is required");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(
                    "Error: Email already exists. One email is related to only one account and cannot be used for another.");
        }

        SecureRandom secureRandom = new SecureRandom();
        String otp = String.format("%06d", secureRandom.nextInt(1000000));
        signupOtpStore.put(email, new OtpData(otp, LocalDateTime.now().plusMinutes(10)));

        emailService.sendEmailVerification(email, otp);

        return ResponseEntity.ok(java.util.Map.of("message", "Verification code sent to your email"));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(
                    "Error: Email already exists. One email is related to only one account and cannot be used for another."); // Account
                                                                                                                              // already
                                                                                                                              // exists
        }

        // Validate password strength first, before consuming the OTP
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body("Error: Password must be at least 8 characters long");
        }
        if (!request.getPassword().matches(".*[A-Za-z].*") || !request.getPassword().matches(".*[0-9].*")) {
            return ResponseEntity.badRequest().body("Error: Password must contain both letters and numbers");
        }

        OtpData otpData = signupOtpStore.get(request.getEmail());
        if (otpData == null || request.getOtp() == null || !otpData.otp.equals(request.getOtp())) {
            return ResponseEntity.badRequest().body("Error: Invalid or missing Verification Code");
        }
        if (otpData.expiry.isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Error: Verification Code Expired");
        }

        // Clear OTP so token isn't reused maliciously
        signupOtpStore.remove(request.getEmail());

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAvatarUrl("https://ui-avatars.com/api/?name=" + request.getName()); // Default avatar
        user.setOnboardingCompleted(true);

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

        // Enforce GitHub verification (Except for Admins)
        boolean githubVerificationRequired = false;
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            if (user.getLastGithubVerifiedAt() == null) {
                githubVerificationRequired = true;
            } else {
                if (user.getLastActiveAt() != null) {
                    java.time.LocalDateTime now = java.time.LocalDateTime.now();
                    java.time.Duration sinceLastActive = java.time.Duration.between(user.getLastActiveAt(), now);
                    if (sinceLastActive.toDays() >= 2) {
                        githubVerificationRequired = true;
                    }
                } else {
                    githubVerificationRequired = true;
                }
            }
        }

        if (githubVerificationRequired) {
            return ResponseEntity.status(401)
                    .body("GitHub verification required: You must verify with GitHub to continue using this account.");
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
            user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(5));
            userRepository.save(user);

            // Send OTP via Email
            emailService.sendOtp(user.getEmail(), otp);
            System.out.println(">>> OTP SENT TO EMAIL: " + user.getEmail());

            // Return response indicating OTP required
            return ResponseEntity.ok(new AuthResponse(null, user, true));
        }

        user.setLastActiveAt(java.time.LocalDateTime.now());
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

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Error: OTP Expired");
        }

        // Clear OTP
        user.setOtp(null);
        user.setOtpExpiry(null);
        user.setLastActiveAt(java.time.LocalDateTime.now());
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
        user.setEmailVerificationExpiry(java.time.LocalDateTime.now().plusMinutes(15));
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
        emailService.sendEmail(email, "Reset Your Password - GitTEnz",
                "Hello " + user.getUsername() + ",\n\nClick the link below to reset your password:\n\n" + resetLink
                        + "\n\nThis link expires in 15 minutes.\n\nRegards,\nGitTEnz Team");

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
                || user.getEmailVerificationExpiry().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Error: Token expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(java.util.Map.of("message", "Password reset successfully"));
    }
}
