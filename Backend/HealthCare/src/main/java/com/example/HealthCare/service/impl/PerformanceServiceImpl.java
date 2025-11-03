package com.example.HealthCare.service.impl;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.example.HealthCare.service.PerformanceService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PerformanceServiceImpl implements PerformanceService {

    private final Map<String, AtomicLong> apiCallCounts = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> totalResponseTimes = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> errorCounts = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> slowQueries = new ConcurrentHashMap<>();

    @Override
    @Async("controllerTaskExecutor")
    public void recordApiCall(String endpoint, long responseTime, String status) {
        // Record API call metrics asynchronously
        apiCallCounts.computeIfAbsent(endpoint, k -> new AtomicLong(0)).incrementAndGet();
        totalResponseTimes.computeIfAbsent(endpoint, k -> new AtomicLong(0)).addAndGet(responseTime);
        
        if ("ERROR".equals(status)) {
            errorCounts.computeIfAbsent(endpoint, k -> new AtomicLong(0)).incrementAndGet();
        }

    }

    @Override
    public Map<String, Object> getPerformanceStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Calculate average response times
        Map<String, Double> averageResponseTimes = new HashMap<>();
        for (String endpoint : apiCallCounts.keySet()) {
            long totalCalls = apiCallCounts.get(endpoint).get();
            long totalTime = totalResponseTimes.getOrDefault(endpoint, new AtomicLong(0)).get();
            double avgTime = totalCalls > 0 ? (double) totalTime / totalCalls : 0;
            averageResponseTimes.put(endpoint, avgTime);
        }

        stats.put("totalApiCalls", apiCallCounts);
        stats.put("averageResponseTimes", averageResponseTimes);
        stats.put("errorCounts", errorCounts);
        stats.put("slowQueries", slowQueries);
        
        return stats;
    }

    @Override
    public Map<String, Object> getApiMetrics(String endpoint) {
        Map<String, Object> metrics = new HashMap<>();
        
        long totalCalls = apiCallCounts.getOrDefault(endpoint, new AtomicLong(0)).get();
        long totalTime = totalResponseTimes.getOrDefault(endpoint, new AtomicLong(0)).get();
        long errors = errorCounts.getOrDefault(endpoint, new AtomicLong(0)).get();
        
        double avgResponseTime = totalCalls > 0 ? (double) totalTime / totalCalls : 0;
        double errorRate = totalCalls > 0 ? (double) errors / totalCalls * 100 : 0;
        
        metrics.put("totalCalls", totalCalls);
        metrics.put("averageResponseTime", avgResponseTime);
        metrics.put("errorCount", errors);
        metrics.put("errorRate", errorRate);
        
        return metrics;
    }

    @Override
    @Async("databaseTaskExecutor")
    public void logSlowQueries(String operation, long executionTime) {
        if (executionTime > 500) {
            slowQueries.computeIfAbsent(operation, k -> new AtomicLong(0)).incrementAndGet();
        }
    }

    @Override
    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        
        // Runtime metrics
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        
        health.put("memoryUsed", usedMemory);
        health.put("memoryFree", freeMemory);
        health.put("memoryTotal", totalMemory);
        health.put("memoryUsagePercent", (double) usedMemory / totalMemory * 100);
        
        // Thread pool metrics would be here if we had access to ThreadPoolTaskExecutor beans
        health.put("availableProcessors", runtime.availableProcessors());
        
        return health;
    }
}
