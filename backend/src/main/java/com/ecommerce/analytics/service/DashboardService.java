package com.ecommerce.analytics.service;

import com.ecommerce.analytics.dto.DashboardMetricsDTO;
import com.ecommerce.analytics.dto.SalesChartDTO;
import com.ecommerce.analytics.repository.AlertRepository;
import com.ecommerce.analytics.repository.CustomerRepository;
import com.ecommerce.analytics.repository.OrderRepository;
import com.ecommerce.analytics.repository.SalesMetricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final AlertRepository alertRepository;
    private final SalesMetricRepository salesMetricRepository;

    @Cacheable(value = "dashboardMetrics", key = "'dashboard-overview'")
    public DashboardMetricsDTO getDashboardMetrics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        // Get metrics for current month
        BigDecimal totalSales = orderRepository.sumTotalAmountBetweenDates(startOfMonth, now);
        Long totalOrders = orderRepository.countOrdersBetweenDates(startOfMonth, now);
        Long totalCustomers = customerRepository.count();
        BigDecimal averageOrderValue = orderRepository.averageOrderValueBetweenDates(startOfMonth, now);
        Integer unreadAlerts = Math.toIntExact(alertRepository.countUnreadAlerts());

        // Format total sales as currency
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(Locale.US);
        String formattedTotalSales = totalSales != null ? currencyFormat.format(totalSales) : "$0.00";

        // Calculate conversion rate (dummy calculation - would need more complex logic in real app)
        Double conversionRate = totalOrders != null && totalOrders > 0 ? 
            (totalCustomers.doubleValue() / totalOrders.doubleValue()) * 100 : 0.0;

        return new DashboardMetricsDTO(
            formattedTotalSales,
            totalOrders != null ? totalOrders : 0L,
            totalCustomers,
            averageOrderValue != null ? averageOrderValue : BigDecimal.ZERO,
            conversionRate,
            unreadAlerts
        );
    }

    @Cacheable(value = "salesData", key = "'sales-chart-7days'")
    public List<SalesChartDTO> getSalesChartData() {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(7);

        return salesMetricRepository.findMetricsBetweenDates(startDate, endDate)
                .stream()
                .map(metric -> new SalesChartDTO(
                    metric.getDate(),
                    metric.getTotalSales(),
                    metric.getTotalOrders(),
                    metric.getAverageOrderValue()
                ))
                .collect(Collectors.toList());
    }
}