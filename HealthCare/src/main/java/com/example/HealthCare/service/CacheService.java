package com.example.HealthCare.service;

import java.util.Set;

public interface CacheService {
    void evictAllCaches();
    void evictUserCaches();
    void evictRoleCaches();
    void evictPrivilegeCaches();
    void evictUserCache(Long userId);
    void evictUserByUsername(String username);
    void warmUpCaches();
    Set<String> getAllCacheNames();
    void clearSpecificCache(String cacheName);
    long getCacheSize(String cacheName);
}
