package com.projectpb.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple memory-based message broker to carry the messages back to the client on destinations prefixed with /topic
        // For production scaling with Redis, we would implement a Redis Pub/Sub bridge here or use an external STOMP broker.
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user"); // Enabled for private messages
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the "/ws-projectpb" endpoint, enabling the SockJS protocol.
        // Handshake endpoint: http://localhost:8080/ws-projectpb
        registry.addEndpoint("/ws-projectpb")
                .setAllowedOriginPatterns("*") // Allow all origins for dev
                .withSockJS();
    }
}

