package com.projectpb.controller;

import com.projectpb.model.GameConfig;
import com.projectpb.model.SupportedGame;
import com.projectpb.repository.GameConfigRepository;
import com.projectpb.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/game-configs")
public class GameConfigController {

    @Autowired
    GameConfigRepository repository;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public List<GameConfig> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameConfig> getById(@PathVariable String id) {
        Optional<GameConfig> config = repository.findById(id);
        if (config.isPresent()) {
            return ResponseEntity.ok(config.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public GameConfig save(@RequestBody GameConfig config) {
        // We still track who modified/created it, but we don't restrict updates based on ownership anymore
        String userId = getCurrentUserId();
        config.setUserId(userId);

        if (config.getId() == null || config.getId().trim().isEmpty()) {
            config.setId(UUID.randomUUID().toString());
        }
        
        return repository.save(config);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}

