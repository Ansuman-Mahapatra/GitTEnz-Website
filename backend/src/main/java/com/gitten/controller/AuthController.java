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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final com.gitten.service.EmailService emailService;
    // Simple encoder for now. In prod, define a Bean.
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

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

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!"); // Account already exists
        }

        // Validate password strength
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body("Error: Password must be at least 8 characters long");
        }
        if (!request.getPassword().matches(".*[A-Za-z].*") || !request.getPassword().matches(".*[0-9].*")) {
            return ResponseEntity.badRequest().body("Error: Password must contain both letters and numbers");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAvatarUrl("https://ui-avatars.com/api/?name=" + request.getName()); // Default avatar

        User savedUser = userRepository.save(user);
        savedUser.setLastActiveAt(java.time.LocalDateTime.now());
        userRepository.save(savedUser);

        // Generate Token
        String token = jwtService.generateToken(new HashMap<>(), savedUser.getUsername());

        return ResponseEntity.ok(new AuthResponse(token, savedUser));
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
}
