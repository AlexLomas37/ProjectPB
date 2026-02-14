package com.projectpb.repository;

import com.projectpb.model.UserConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserConfigRepository extends MongoRepository<UserConfig, String> {
    Optional<UserConfig> findByUserId(String userId);
}

