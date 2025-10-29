package com.example.HealthCare.service;

import java.util.Map;

public interface PerformanceService {
    void recordApiCall(String endpoint, long responseTime, String status);
    Map<String, Object> getPerformanceStats();
    Map<String, Object> getApiMetrics(String endpoint);
    void logSlowQueries(String operation, long executionTime);
    Map<String, Object> getSystemHealth();
}
