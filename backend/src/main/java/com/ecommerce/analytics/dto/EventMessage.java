package com.ecommerce.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventMessage {
    private String eventType;
    private String entityType;
    private Long entityId;
    private Map<String, Object> data;
    private LocalDateTime timestamp;
    private String source;
    
    public EventMessage(String eventType, String entityType, Long entityId, Map<String, Object> data) {
        this.eventType = eventType;
        this.entityType = entityType;
        this.entityId = entityId;
        this.data = data;
        this.timestamp = LocalDateTime.now();
        this.source = "analytics-api";
    }
}