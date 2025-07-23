package com.ecommerce.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricsDTO {
    private String totalSales;
    private Long totalOrders;
    private Long totalCustomers;
    private BigDecimal averageOrderValue;
    private Double conversionRate;
    private Integer unreadAlerts;
}