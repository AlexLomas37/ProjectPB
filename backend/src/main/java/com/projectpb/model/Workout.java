package com.projectpb.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "workouts")
public class Workout {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String gameId;
    private SupportedGame game;
    private String title;
    private String description;
    private String category; // Warmup, Training
    private String duration; // String to support "15m" etc.
    private String difficulty; // Facile, Moyen, Difficile
    private List<Exercise> exercises;
    private List<String> tags;
    private String notes;
}

