package com.projectpb.controller;

import com.projectpb.model.Role;
import com.projectpb.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/roles")
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    @Autowired
    RoleRepository roleRepository;

    @GetMapping
    public List<Role> getAll() {
        return roleRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Role> create(@RequestBody Role role) {
        if (role.getName() == null || role.getName().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Enforce ROLE_ prefix convention
        String roleName = role.getName().toUpperCase();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }
        
        if (roleRepository.findByName(roleName).isPresent()) {
            return ResponseEntity.badRequest().build(); // Already exists
        }

        role.setName(roleName);
        if (role.getId() == null) {
            role.setId(UUID.randomUUID().toString());
        }
        
        return ResponseEntity.ok(roleRepository.save(role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (roleRepository.existsById(id)) {
            roleRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}