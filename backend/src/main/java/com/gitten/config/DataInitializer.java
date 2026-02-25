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

                // Generate a secure random password
                String randomPassword = java.util.UUID.randomUUID().toString().substring(0, 8);
                admin.setPassword(new BCryptPasswordEncoder().encode(randomPassword));

                admin.setAvatarUrl("https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff");
                admin.setOnboardingCompleted(true);
                admin.setRole("ADMIN");
                userRepository.save(admin);

                // Log the generated password clearly
                System.out.println("\n\n=================================================");
                System.out.println("ADMIN ACCOUNT CREATED");
                System.out.println("Username: " + adminUsername);
                System.out.println("Password: " + randomPassword);
                System.out.println("Please change this password immediately after login.");
                System.out.println("=================================================\n\n");
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
