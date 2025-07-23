package com.ecommerce.analytics.repository;

import com.ecommerce.analytics.entity.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    
    @Query("SELECT a FROM Alert a WHERE a.isRead = false ORDER BY a.createdAt DESC")
    List<Alert> findUnreadAlerts();
    
    @Query("SELECT a FROM Alert a WHERE a.severity = :severity ORDER BY a.createdAt DESC")
    List<Alert> findBySeverity(@Param("severity") String severity);
    
    @Query("SELECT a FROM Alert a WHERE a.type = :type ORDER BY a.createdAt DESC")
    List<Alert> findByType(@Param("type") String type);
    
    @Query("SELECT a FROM Alert a ORDER BY a.createdAt DESC")
    Page<Alert> findAllOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT COUNT(a) FROM Alert a WHERE a.isRead = false")
    Long countUnreadAlerts();
}