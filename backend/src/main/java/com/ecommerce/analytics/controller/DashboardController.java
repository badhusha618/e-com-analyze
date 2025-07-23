package com.ecommerce.analytics.controller;

import com.ecommerce.analytics.dto.ApiResponse;
import com.ecommerce.analytics.dto.DashboardMetricsDTO;
import com.ecommerce.analytics.dto.SalesChartDTO;
import com.ecommerce.analytics.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard analytics APIs")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/metrics")
    @Operation(summary = "Get dashboard metrics", description = "Retrieve key dashboard metrics including sales, orders, and customers")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardMetricsDTO>> getDashboardMetrics() {
        DashboardMetricsDTO metrics = dashboardService.getDashboardMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    @GetMapping("/sales-chart")
    @Operation(summary = "Get sales chart data", description = "Retrieve sales data for chart visualization")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SalesChartDTO>>> getSalesChart() {
        List<SalesChartDTO> salesData = dashboardService.getSalesChartData();
        return ResponseEntity.ok(ApiResponse.success(salesData));
    }
}