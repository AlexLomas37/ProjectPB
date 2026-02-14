package com.projectpb.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "training_sessions")
public class TrainingSession {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String gameId;
    private String workoutId;
    private String title;
    private String type;
    private String difficulty;
    private List<String> tags;
    private String notes;
    private String createdAt;
    private String date; // ISO String
    private String duration; // String to support "15m" etc.
    private List<ExerciseLog> logs;
    private String status; // COMPLETED, ABORTED
}

