package com.projectpb.model;

import lombok.Data;
import java.util.Map;

@Data
public class ExerciseLog {
    private String exerciseId;
    private boolean completed;
    private String actualDuration;
    private String notes;
    private Double score;
    private Map<String, String> metrics; // Flexible metrics from frontend
    private String timestamp;
}

