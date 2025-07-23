package com.ecommerce.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String sku;
    private BigDecimal price;
    private Integer inventory;
    private String categoryName;
    private String vendorName;
    private BigDecimal rating;
    private Integer reviewCount;
    private BigDecimal totalRevenue;
    private Integer unitsSold;
}