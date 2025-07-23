package com.ecommerce.analytics.service;

import com.ecommerce.analytics.entity.Alert;
import com.ecommerce.analytics.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final KafkaProducerService kafkaProducerService;

    @Cacheable(value = "alerts", key = "'unread'")
    public List<Alert> getUnreadAlerts() {
        return alertRepository.findUnreadAlerts();
    }

    public Page<Alert> getAllAlerts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return alertRepository.findAllOrderByCreatedAtDesc(pageable);
    }

    public List<Alert> getAlertsBySeverity(String severity) {
        return alertRepository.findBySeverity(severity);
    }

    public List<Alert> getAlertsByType(String type) {
        return alertRepository.findByType(type);
    }

    @CacheEvict(value = "alerts", allEntries = true)
    public Alert createAlert(Alert alert) {
        Alert savedAlert = alertRepository.save(alert);
        
        // Send Kafka event
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("alertType", alert.getType());
        eventData.put("severity", alert.getSeverity());
        eventData.put("title", alert.getTitle());
        kafkaProducerService.sendAlertEvent("ALERT_CREATED", savedAlert.getId(), eventData);
        
        return savedAlert;
    }

    @CacheEvict(value = "alerts", allEntries = true)
    public Alert markAsRead(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        
        alert.setIsRead(true);
        Alert updatedAlert = alertRepository.save(alert);
        
        // Send Kafka event
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("alertType", alert.getType());
        kafkaProducerService.sendAlertEvent("ALERT_READ", alertId, eventData);
        
        return updatedAlert;
    }

    public Long getUnreadAlertsCount() {
        return alertRepository.countUnreadAlerts();
    }
}