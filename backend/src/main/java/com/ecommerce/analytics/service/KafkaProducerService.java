package com.ecommerce.analytics.service;

import com.ecommerce.analytics.dto.EventMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendOrderEvent(String eventType, Long orderId, Map<String, Object> data) {
        EventMessage event = new EventMessage(eventType, "ORDER", orderId, data);
        sendEvent("order-events", event);
    }

    public void sendProductEvent(String eventType, Long productId, Map<String, Object> data) {
        EventMessage event = new EventMessage(eventType, "PRODUCT", productId, data);
        sendEvent("product-events", event);
    }

    public void sendAlertEvent(String eventType, Long alertId, Map<String, Object> data) {
        EventMessage event = new EventMessage(eventType, "ALERT", alertId, data);
        sendEvent("alert-events", event);
    }

    public void sendAnalyticsEvent(String eventType, Map<String, Object> data) {
        EventMessage event = new EventMessage(eventType, "ANALYTICS", null, data);
        sendEvent("analytics-events", event);
    }

    private void sendEvent(String topic, EventMessage event) {
        try {
            kafkaTemplate.send(topic, event.getEntityId() != null ? event.getEntityId().toString() : "analytics", event);
            log.info("Event sent to topic {}: {}", topic, event.getEventType());
        } catch (Exception e) {
            log.error("Failed to send event to topic {}: {}", topic, e.getMessage());
        }
    }
}