package com.projectpb.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "ranked_sessions")
public class RankedSession {
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    private String gameId;
    private SupportedGame game;
    private Long startTime;
    private Long endTime;
    private List<Game> games;
    private Integer startLp;
    private Integer currentLp;
    private Integer targetLp;
    private String status; // ACTIVE, COMPLETED

    // Fields from frontend
    private String mode;
    private String result;
    private Integer pointsChange;
    private String notes;
    private String date;
}

