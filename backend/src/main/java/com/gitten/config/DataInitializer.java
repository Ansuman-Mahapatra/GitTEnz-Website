package com.gitten.config;

import com.gitten.model.User;
import com.gitten.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
            @org.springframework.beans.factory.annotation.Value("${admin.initial.email}") String adminEmail) {
        return args -> {
            String adminUsername = "admin";
            User admin = userRepository.findByUsername(adminUsername).orElse(null);

            if (admin == null) {
                admin = new User();
                admin.setUsername(adminUsername);
                admin.setEmail(adminEmail);
                admin.setName("System Administrator");
                // Hardcoded password "admin123" - In production read from env
                admin.setPassword(new BCryptPasswordEncoder().encode("admin123"));
                admin.setAvatarUrl("https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff");
                admin.setOnboardingCompleted(true);
                admin.setRole("ADMIN");
                userRepository.save(admin);
                System.out.println("Persistent Admin Account Created: admin / admin123 with email: " + adminEmail);
            } else {
                // Ensure role is ADMIN
                boolean changed = false;
                if (admin.getRole() == null || !admin.getRole().equals("ADMIN")) {
                    admin.setRole("ADMIN");
                    changed = true;
                }
                // We do NOT overwrite the email here, to allow the admin to change it in the
                // DB.

                if (changed) {
                    userRepository.save(admin);
                    System.out.println("Admin account role verification completed.");
                }
            }
        };
    }
}
