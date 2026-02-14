package com.projectpb.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RealtimeService {

    private final StringRedisTemplate redisTemplate;

    /**
     * Publish an event to a specific game topic in Redis.
     * This allows other instances (or this one) to pick it up and broadcast via WebSockets.
     */
    public void publishGameEvent(String gameId, String eventType, String payload) {
        String channel = "game:" + gameId; // Redis Channel
        String message = eventType + "|" + payload; // Simple protocol: TYPE|PAYLOAD
        redisTemplate.convertAndSend(channel, message);
    }

    // Note: Subscription logic usually goes in a separate RedisMessageListenerContainer config
    // For this prototype, we'll assume single-instance for now but keep the publisher ready.
}

