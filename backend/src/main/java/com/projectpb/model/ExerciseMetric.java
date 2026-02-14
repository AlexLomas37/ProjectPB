package com.projectpb.model;

import lombok.Data;

@Data
public class ExerciseMetric {
    private String id;
    private String type; // RATIO, SCORE, PERCENTAGE
    private String label;
    private String unit;
}

