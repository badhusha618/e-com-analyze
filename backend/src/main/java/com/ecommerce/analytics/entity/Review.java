package com.ecommerce.analytics.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "product_id")
    private Long productId;
    
    @NotNull
    @Column(name = "customer_id")
    private Long customerId;
    
    @Min(1)
    @Max(5)
    private Integer rating;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private String sentiment;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "vendor_response", columnDefinition = "TEXT")
    private String vendorResponse;
    
    @Column(name = "review_date")
    private LocalDateTime reviewDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private Customer customer;
    
    @PrePersist
    protected void onCreate() {
        reviewDate = LocalDateTime.now();
    }
}