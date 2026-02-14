package com.projectpb.controller;

import com.projectpb.model.TrainingSession;
import com.projectpb.repository.TrainingSessionRepository;
import com.projectpb.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/training-sessions")
public class TrainingSessionController {

    @Autowired
    TrainingSessionRepository repository;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public List<TrainingSession> getAll() {
        return repository.findByUserId(getCurrentUserId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingSession> getById(@PathVariable String id) {
        Optional<TrainingSession> item = repository.findById(id);
        if (item.isPresent() && item.get().getUserId().equals(getCurrentUserId())) {
             return ResponseEntity.ok(item.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public TrainingSession create(@RequestBody TrainingSession item) {
        if (item.getId() == null) {
            item.setId(java.util.UUID.randomUUID().toString());
        }
        item.setUserId(getCurrentUserId());
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainingSession> update(@PathVariable String id, @RequestBody TrainingSession item) {
        Optional<TrainingSession> existing = repository.findById(id);
        if (existing.isPresent() && existing.get().getUserId().equals(getCurrentUserId())) {
            item.setId(id);
            item.setUserId(getCurrentUserId());
            return ResponseEntity.ok(repository.save(item));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        Optional<TrainingSession> existing = repository.findById(id);
        if (existing.isPresent() && existing.get().getUserId().equals(getCurrentUserId())) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}

