package com.example.HealthCare.util;

import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class PerformanceMonitor {

    public static long measureExecutionTime(Runnable operation, String operationName) {
        long startTime = System.currentTimeMillis();
        
        try {
            operation.run();
        } catch (Exception e) {
            log.error("Error during execution of {}: {}", operationName, e.getMessage());
            throw e;
        }
        
        long endTime = System.currentTimeMillis();
        return endTime - startTime;
    }
}
