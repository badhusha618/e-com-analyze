package com.ecommerce.analytics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
// import org.springframework.kafka.annotation.EnableKafka; // Disabled for demo

@SpringBootApplication
// @EnableCaching  // Disabled for demo
// @EnableKafka   // Disabled for demo  
public class AnalyticsApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnalyticsApiApplication.class, args);
    }
}