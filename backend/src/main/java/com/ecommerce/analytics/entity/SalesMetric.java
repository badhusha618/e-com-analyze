package com.ecommerce.analytics.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesMetric {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    private LocalDateTime date;
    
    @NotNull
    @Column(name = "total_sales", precision = 10, scale = 2)
    private BigDecimal totalSales;
    
    @NotNull
    @Column(name = "total_orders")
    private Integer totalOrders;
    
    @NotNull
    @Column(name = "average_order_value", precision = 10, scale = 2)
    private BigDecimal averageOrderValue;
    
    @NotNull
    @Column(name = "return_rate", precision = 5, scale = 4)
    private BigDecimal returnRate;
    
    @Column(name = "new_customers")
    private Integer newCustomers = 0;
}