package com.projectpb.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

@Data
@Document(collection = "user_configs")
public class UserConfig {
    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private Set<String> hiddenGameIds = new HashSet<>();

    private Map<String, Object> config;
}

