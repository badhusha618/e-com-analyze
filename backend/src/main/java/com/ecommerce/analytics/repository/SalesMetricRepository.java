package com.ecommerce.analytics.repository;

import com.ecommerce.analytics.entity.SalesMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SalesMetricRepository extends JpaRepository<SalesMetric, Long> {
    
    @Query("SELECT sm FROM SalesMetric sm WHERE sm.date >= :startDate AND sm.date <= :endDate ORDER BY sm.date ASC")
    List<SalesMetric> findMetricsBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT sm FROM SalesMetric sm ORDER BY sm.date DESC")
    List<SalesMetric> findLatestMetrics();
    
    @Query("SELECT sm FROM SalesMetric sm WHERE sm.date >= :date ORDER BY sm.date DESC")
    List<SalesMetric> findMetricsFromDate(@Param("date") LocalDateTime date);
}