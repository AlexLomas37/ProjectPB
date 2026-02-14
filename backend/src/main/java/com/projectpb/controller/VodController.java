package com.projectpb.controller;

import com.projectpb.model.Vod;
import com.projectpb.repository.VodRepository;
import com.projectpb.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/vods")
public class VodController {

    @Autowired
    VodRepository repository;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public List<Vod> getAll() {
        return repository.findByUserId(getCurrentUserId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vod> getById(@PathVariable String id) {
        Optional<Vod> item = repository.findById(id);
        if (item.isPresent() && item.get().getUserId().equals(getCurrentUserId())) {
             return ResponseEntity.ok(item.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public Vod create(@RequestBody Vod item) {
        if (item.getId() == null) {
            item.setId(java.util.UUID.randomUUID().toString());
        }
        item.setUserId(getCurrentUserId());
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vod> update(@PathVariable String id, @RequestBody Vod item) {
        Optional<Vod> existing = repository.findById(id);
        if (existing.isPresent() && existing.get().getUserId().equals(getCurrentUserId())) {
            item.setId(id);
            item.setUserId(getCurrentUserId());
            return ResponseEntity.ok(repository.save(item));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        Optional<Vod> existing = repository.findById(id);
        if (existing.isPresent() && existing.get().getUserId().equals(getCurrentUserId())) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}

