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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    // Simple encoder for now. In prod, define a Bean.
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!"); // Account already exists
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAvatarUrl("https://ui-avatars.com/api/?name=" + request.getName()); // Default avatar

        User savedUser = userRepository.save(user);

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

        String token = jwtService.generateToken(new HashMap<>(), user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, user));
    }
}
