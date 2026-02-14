package com.projectpb.model;

import lombok.Data;

@Data
public class GameComment {
    private String id;
    private String text;
    private Long createdAt;
}

