package com.projectpb.websocket;

import com.projectpb.service.RealtimeService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class StompController {

    private final RealtimeService realtimeService;

    // Client sends to: /app/game/{gameId}/tag
    // Server broadcasts to: /topic/game/{gameId}
    @MessageMapping("/game/{gameId}/tag")
    @SendTo("/topic/game/{gameId}")
    public TagEvent handleTag(@DestinationVariable String gameId, @Payload TagEvent event) {
        // Here we could persist the tag to MongoDB via GameService if needed
        realtimeService.publishGameEvent(gameId, "TAG", event.toString());
        return event; // Echoes back to all subscribers of /topic/game/{gameId}
    }

    @Data
    @AllArgsConstructor // For JSON deserialization
    static class TagEvent {
        private String type;
        private Long timestamp;
        private String userId;
    }
}

