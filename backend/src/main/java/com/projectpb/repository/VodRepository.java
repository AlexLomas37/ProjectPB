package com.projectpb.repository;

import com.projectpb.model.Vod;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VodRepository extends MongoRepository<Vod, String> {
    List<Vod> findByUserId(String userId);
}

