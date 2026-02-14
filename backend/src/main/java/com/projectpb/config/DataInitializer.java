package com.projectpb.config;

import com.projectpb.model.Role;
import com.projectpb.model.User;
import com.projectpb.repository.RoleRepository;
import com.projectpb.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.UUID;

@Configuration
public class DataInitializer {

    @org.springframework.beans.factory.annotation.Value("${APP_ADMIN_PASSWORD:password}")
    private String adminPassword;

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Init Roles
            if (roleRepository.count() == 0) {
                Role adminRole = new Role();
                adminRole.setId(UUID.randomUUID().toString());
                adminRole.setName("ROLE_ADMIN");
                roleRepository.save(adminRole);

                Role userRole = new Role();
                userRole.setId(UUID.randomUUID().toString());
                userRole.setName("ROLE_USER");
                roleRepository.save(userRole);

                Role devRole = new Role();
                devRole.setId(UUID.randomUUID().toString());
                devRole.setName("ROLE_DEV");
                roleRepository.save(devRole);
                
                System.out.println("✅ Roles initialized");
            }

            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@bmad.com");
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRoles(Collections.singleton("ROLE_ADMIN"));
                
                userRepository.save(admin);
                System.out.println("✅ Admin user created: admin / " + adminPassword);
            }
        };
    }
}

