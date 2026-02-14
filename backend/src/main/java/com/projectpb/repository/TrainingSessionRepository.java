package com.projectpb.repository;

import com.projectpb.model.TrainingSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingSessionRepository extends MongoRepository<TrainingSession, String> {
    List<TrainingSession> findByUserId(String userId);
}

