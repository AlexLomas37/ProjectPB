package com.projectpb.repository;

import com.projectpb.model.Workout;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutRepository extends MongoRepository<Workout, String> {
    List<Workout> findByUserId(String userId);
}

