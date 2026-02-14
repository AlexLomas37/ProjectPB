package com.projectpb.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "vods")
public class Vod {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;
    private String gameId;
    private SupportedGame game;
    private VodType type; // YOUTUBE, TWITCH, REPLAY, OTHER
    private String url;
    private String thumbnailUrl;
    private String date; // Changed from Long to String to match frontend
    private String duration;
    private List<String> tags;
    private boolean isReplay;
    private String notes;
    private List<VodComment> comments;
}

