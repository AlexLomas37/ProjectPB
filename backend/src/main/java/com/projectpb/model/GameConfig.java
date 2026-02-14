package com.projectpb.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Data
@Document(collection = "game_configs")
public class GameConfig {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String game;
    private String displayName;
    private ConfigColors colors;
    private ConfigTerminology terminology;
    private List<ConfigRank> ranks;
    private ConfigAssets assets;
    private boolean hidden = true;
    private ConfigFeatures features;
    
    private List<Map<String, Object>> maps;
    private List<Map<String, Object>> agents;
    private List<Map<String, Object>> metrics;

    @Data
    public static class ConfigAssets {
        private String logoUrl;
    }

    @Data
    public static class ConfigColors {
        private String primary;
        private String background;
        private String headerFooter;
    }

    @Data
    public static class ConfigTerminology {
        private String points;
        private String rank;
    }

    @Data
    public static class ConfigRank {
        private String name;
        private String iconUrl;
    }

    @Data
    public static class ConfigFeatures {
        private boolean hasAgent;
        private boolean hasMap;
        private boolean hasKDA;
        private boolean hasScore;
        private boolean hasMental;
        private boolean hasPerformance;
    }
}

