package com.projectpb.controller;

import com.projectpb.model.UserConfig;
import com.projectpb.repository.UserConfigRepository;
import com.projectpb.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/config")
public class UserConfigController {

    @Autowired
    UserConfigRepository repository;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public ResponseEntity<UserConfig> get() {
        Optional<UserConfig> config = repository.findByUserId(getCurrentUserId());
        return config.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public UserConfig update(@RequestBody UserConfig item) {
        String userId = getCurrentUserId();
        Optional<UserConfig> existingOpt = repository.findByUserId(userId);
        
        UserConfig configToSave;
        if (existingOpt.isPresent()) {
            configToSave = existingOpt.get();
            if (item.getHiddenGameIds() != null) {
                configToSave.setHiddenGameIds(item.getHiddenGameIds());
            }
            if (item.getConfig() != null) {
                if (configToSave.getConfig() == null) {
                    configToSave.setConfig(item.getConfig());
                } else {
                    configToSave.getConfig().putAll(item.getConfig());
                }
            }
        } else {
            configToSave = item;
            configToSave.setUserId(userId);
            if (configToSave.getId() == null) {
                configToSave.setId(java.util.UUID.randomUUID().toString());
            }
        }
        
        return repository.save(configToSave);
    }
}

