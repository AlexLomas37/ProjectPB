package com.projectpb.model;

import lombok.Data;
import java.util.List;

@Data
public class Game {
    private String id;
    private Long timestamp;
    private String champion;
    private GameResult result; // WIN, LOSS, REMAKE
    private int kills;
    private int deaths;
    private int assists;
    private int lpChange;
    private String notes;
    private List<GameComment> comments;
}

