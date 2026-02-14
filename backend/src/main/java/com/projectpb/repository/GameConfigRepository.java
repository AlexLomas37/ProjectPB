package com.projectpb.repository;

import com.projectpb.model.GameConfig;
import com.projectpb.model.SupportedGame;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameConfigRepository extends MongoRepository<GameConfig, String> {
    List<GameConfig> findByUserId(String userId);
    Optional<GameConfig> findByUserIdAndGame(String userId, SupportedGame game);
}

