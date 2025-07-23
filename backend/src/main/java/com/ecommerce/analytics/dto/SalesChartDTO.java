package com.ecommerce.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesChartDTO {
    private LocalDateTime date;
    private BigDecimal sales;
    private Integer orders;
    private BigDecimal averageOrderValue;
}