package com.ecommerce.analytics.controller;

import com.ecommerce.analytics.dto.ApiResponse;
import com.ecommerce.analytics.entity.Alert;
import com.ecommerce.analytics.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/alerts")
@RequiredArgsConstructor
@Tag(name = "Alerts", description = "Alert management APIs")
@SecurityRequirement(name = "bearerAuth")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @Operation(summary = "Get all alerts", description = "Retrieve paginated list of all alerts")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<Alert>>> getAllAlerts(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        Page<Alert> alerts = alertService.getAllAlerts(page, size);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread alerts", description = "Retrieve list of unread alerts")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Alert>>> getUnreadAlerts() {
        List<Alert> alerts = alertService.getUnreadAlerts();
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/severity/{severity}")
    @Operation(summary = "Get alerts by severity", description = "Retrieve alerts filtered by severity level")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Alert>>> getAlertsBySeverity(
            @Parameter(description = "Severity level") @PathVariable String severity) {
        List<Alert> alerts = alertService.getAlertsBySeverity(severity);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get alerts by type", description = "Retrieve alerts filtered by type")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Alert>>> getAlertsByType(
            @Parameter(description = "Alert type") @PathVariable String type) {
        List<Alert> alerts = alertService.getAlertsByType(type);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @PostMapping("/{alertId}/mark-read")
    @Operation(summary = "Mark alert as read", description = "Mark a specific alert as read")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Alert>> markAlertAsRead(
            @Parameter(description = "Alert ID") @PathVariable Long alertId) {
        try {
            Alert alert = alertService.markAsRead(alertId);
            return ResponseEntity.ok(ApiResponse.success("Alert marked as read", alert));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to mark alert as read: " + e.getMessage()));
        }
    }

    @GetMapping("/count/unread")
    @Operation(summary = "Get unread alerts count", description = "Get the count of unread alerts")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getUnreadAlertsCount() {
        Long count = alertService.getUnreadAlertsCount();
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}