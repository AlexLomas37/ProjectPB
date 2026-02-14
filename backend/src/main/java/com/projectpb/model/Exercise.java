package com.projectpb.model;

import lombok.Data;
import java.util.List;

@Data
public class Exercise {
    private String id;
    private String title;
    private String description;
    private String duration; // Changed to String
    private Integer repetitions;
    private String videoUrl;
    private List<ExerciseMetric> metrics;
}

