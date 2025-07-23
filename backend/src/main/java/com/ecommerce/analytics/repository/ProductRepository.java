package com.ecommerce.analytics.repository;

import com.ecommerce.analytics.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true")
    Page<Product> findActiveProducts(Pageable pageable);
    
    @Query("""
        SELECT p FROM Product p 
        JOIN OrderItem oi ON p.id = oi.productId 
        GROUP BY p.id 
        ORDER BY SUM(oi.quantity * oi.unitPrice) DESC
    """)
    List<Product> findTopSellingProducts(Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.inventory < :threshold AND p.isActive = true")
    List<Product> findLowStockProducts(@Param("threshold") Integer threshold);
    
    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);
    
    List<Product> findByVendorIdAndIsActiveTrue(Long vendorId);
    
    @Query("SELECT p FROM Product p WHERE p.name ILIKE %:name% AND p.isActive = true")
    Page<Product> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);
}