package com.example.HealthCare.controller;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.service.PerformanceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
@Slf4j
public class PerformanceController {

    private final PerformanceService performanceService;

    @GetMapping("/stats")
    @Async("controllerTaskExecutor")
    public CompletableFuture<ResponseEntity<ResponseSuccess>> getPerformanceStats() {
        return CompletableFuture.supplyAsync(() -> {
            Map<String, Object> stats = performanceService.getPerformanceStats();
            return ResponseEntity.ok(
                new ResponseSuccess(HttpStatus.OK, "Performance statistics retrieved successfully", stats)
            );
        });
    }

    @GetMapping("/metrics/{endpoint}")
    @Async("controllerTaskExecutor")
    public CompletableFuture<ResponseEntity<ResponseSuccess>> getApiMetrics(@PathVariable String endpoint) {
        return CompletableFuture.supplyAsync(() -> {
            Map<String, Object> metrics = performanceService.getApiMetrics(endpoint);
            return ResponseEntity.ok(
                new ResponseSuccess(HttpStatus.OK, "API metrics retrieved successfully", metrics)
            );
        });
    }

    @GetMapping("/health")
    @Async("controllerTaskExecutor")
    public CompletableFuture<ResponseEntity<ResponseSuccess>> getSystemHealth() {
        return CompletableFuture.supplyAsync(() -> {
            Map<String, Object> health = performanceService.getSystemHealth();
            return ResponseEntity.ok(
                new ResponseSuccess(HttpStatus.OK, "System health retrieved successfully", health)
            );
        });
    }
}
