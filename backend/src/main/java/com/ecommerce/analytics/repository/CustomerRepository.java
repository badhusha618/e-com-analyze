package com.ecommerce.analytics.repository;

import com.ecommerce.analytics.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.registrationDate >= :startDate AND c.registrationDate <= :endDate")
    Long countNewCustomersBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                      @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT c FROM Customer c ORDER BY c.totalSpent DESC")
    List<Customer> findTopCustomersBySpending(Pageable pageable);
    
    @Query("SELECT c FROM Customer c WHERE c.totalSpent >= :minSpent ORDER BY c.totalSpent DESC")
    Page<Customer> findHighValueCustomers(@Param("minSpent") BigDecimal minSpent, Pageable pageable);
    
    @Query("SELECT c FROM Customer c WHERE c.orderCount >= :minOrders ORDER BY c.orderCount DESC")
    Page<Customer> findFrequentCustomers(@Param("minOrders") Integer minOrders, Pageable pageable);
    
    boolean existsByEmail(String email);
}