package com.projectpb.repository;

import com.projectpb.model.RankedSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RankedSessionRepository extends MongoRepository<RankedSession, String> {
    List<RankedSession> findByUserId(String userId);
}

