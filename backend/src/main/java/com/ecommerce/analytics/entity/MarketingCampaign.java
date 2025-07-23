package com.ecommerce.analytics.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketing_campaigns")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketingCampaign {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String name;
    
    @NotBlank
    private String channel;
    
    @NotNull
    @Column(precision = 10, scale = 2)
    private BigDecimal budget;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal spent = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal revenue = BigDecimal.ZERO;
    
    private Integer clicks = 0;
    
    private Integer impressions = 0;
    
    private Integer conversions = 0;
    
    @NotNull
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
}