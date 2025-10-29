package com.example.HealthCare.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.service.CacheService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/cache")
@RequiredArgsConstructor
@Slf4j
public class CacheController {

    private final CacheService cacheService;

    @GetMapping("/names")
    @Async("cacheTaskExecutor")
    public CompletableFuture<ResponseEntity<ResponseSuccess>> getAllCacheNames() {
        return CompletableFuture.supplyAsync(() -> {
            Set<String> cacheNames = cacheService.getAllCacheNames();
            return ResponseEntity.ok(
                new ResponseSuccess(HttpStatus.OK, "Cache names retrieved successfully", cacheNames)
            );
        });
    }

    @GetMapping("/stats")
    @Async("cacheTaskExecutor")
    public CompletableFuture<ResponseEntity<ResponseSuccess>> getCacheStats() {
        return CompletableFuture.supplyAsync(() -> {
            Map<String, Object> stats = new HashMap<>();
            
            Set<String> cacheNames = cacheService.getAllCacheNames();
            stats.put("cacheNames", cacheNames);
            stats.put("totalCaches", cacheNames.size());
            
            Map<String, Long> cacheSizes = new HashMap<>();
            cacheNames.forEach(name -> {
                cacheSizes.put(name, cacheService.getCacheSize(name));
            });
            stats.put("cacheSizes", cacheSizes);
            
            return ResponseEntity.ok(
                new ResponseSuccess(HttpStatus.OK, "Cache statistics retrieved successfully", stats)
            );
        });
    }

    @DeleteMapping("/all")
    @Async("cacheTaskExecutor")
    public CompletableFuture<ResponseEntity<ResponseSuccess>> clearAllCaches() {
        return CompletableFuture.supplyAsync(() -> {
            log.info("Admin requested to clear all caches");
            cacheService.evictAllCaches();
            return ResponseEntity.ok(
                new ResponseSuccess(HttpStatus.OK, "All caches cleared successfully")
            );
        });
    }

    @DeleteMapping("/users")
    public ResponseEntity<ResponseSuccess> clearUserCaches() {
        log.info("Admin requested to clear user caches");
        cacheService.evictUserCaches();
        return ResponseEntity.ok(
            new ResponseSuccess(HttpStatus.OK, "User caches cleared successfully")
        );
    }

    @DeleteMapping("/roles")
    public ResponseEntity<ResponseSuccess> clearRoleCaches() {
        log.info("Admin requested to clear role caches");
        cacheService.evictRoleCaches();
        return ResponseEntity.ok(
            new ResponseSuccess(HttpStatus.OK, "Role caches cleared successfully")
        );
    }

    @DeleteMapping("/privileges")
    public ResponseEntity<ResponseSuccess> clearPrivilegeCaches() {
        log.info("Admin requested to clear privilege caches");
        cacheService.evictPrivilegeCaches();
        return ResponseEntity.ok(
            new ResponseSuccess(HttpStatus.OK, "Privilege caches cleared successfully")
        );
    }

    @DeleteMapping("/{cacheName}")
    @Async("cacheTaskExecutor")
    public CompletableFuture<ResponseEntity<ResponseSuccess>> clearSpecificCache(@PathVariable String cacheName) {
        return CompletableFuture.supplyAsync(() -> {
            log.info("Admin requested to clear cache: {}", cacheName);
            cacheService.clearSpecificCache(cacheName);
            return ResponseEntity.ok(
                new ResponseSuccess(HttpStatus.OK, "Cache '" + cacheName + "' cleared successfully")
            );
        });
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<ResponseSuccess> clearUserCache(@PathVariable Long userId) {
        log.info("Admin requested to clear cache for user ID: {}", userId);
        cacheService.evictUserCache(userId);
        return ResponseEntity.ok(
            new ResponseSuccess(HttpStatus.OK, "Cache for user " + userId + " cleared successfully")
        );
    }

    @DeleteMapping("/username/{username}")
    public ResponseEntity<ResponseSuccess> clearUserCacheByUsername(@PathVariable String username) {
        log.info("Admin requested to clear cache for username: {}", username);
        cacheService.evictUserByUsername(username);
        return ResponseEntity.ok(
            new ResponseSuccess(HttpStatus.OK, "Cache for username '" + username + "' cleared successfully")
        );
    }

    @PostMapping("/warmup")
    @Async("cacheTaskExecutor")
    public CompletableFuture<ResponseEntity<ResponseSuccess>> warmUpCaches() {
        return CompletableFuture.supplyAsync(() -> {
            log.info("Admin requested cache warm-up");
            cacheService.warmUpCaches();
            return ResponseEntity.ok(
                new ResponseSuccess(HttpStatus.OK, "Cache warm-up completed successfully")
            );
        });
    }

    @GetMapping("/size/{cacheName}")
    public ResponseEntity<ResponseSuccess> getCacheSize(@PathVariable String cacheName) {
        long size = cacheService.getCacheSize(cacheName);
        return ResponseEntity.ok(
            new ResponseSuccess(HttpStatus.OK, "Cache size retrieved successfully", size)
        );
    }
}
