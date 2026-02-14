package com.projectpb.model;

import lombok.Data;

@Data
public class VodComment {
    private String id;
    private int timestampSeconds;
    private String text;
    private Long createdAt;
}

