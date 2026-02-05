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
    public CommandLineRunner initData(UserRepository userRepository) {
        return args -> {
            String adminUsername = "admin";
            if (userRepository.findByUsername(adminUsername).isEmpty()) {
                User admin = new User();
                admin.setUsername(adminUsername);
                admin.setEmail("admin@gittenz.com");
                admin.setName("System Administrator");
                // Hardcoded password "admin123" - In production read from env
                admin.setPassword(new BCryptPasswordEncoder().encode("admin123"));
                admin.setAvatarUrl("https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff");
                admin.setOnboardingCompleted(true);
                userRepository.save(admin);
                System.out.println("Persistent Admin Account Created: admin / admin123");
            }
        };
    }
}
