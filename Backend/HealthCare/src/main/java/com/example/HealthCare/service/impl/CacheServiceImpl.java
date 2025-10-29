package com.example.HealthCare.service.impl;

import java.util.Set;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.example.HealthCare.enums.RoleType;
import com.example.HealthCare.repository.RoleRepository;
import com.example.HealthCare.service.CacheService;
import com.example.HealthCare.service.RoleService;
import com.example.HealthCare.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheServiceImpl implements CacheService {

    private final CacheManager cacheManager;
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserService userService;
    private final RoleService roleService;
    private final RoleRepository roleRepository;

    @Override
    public void evictAllCaches() {
        log.info("Evicting all caches");
        cacheManager.getCacheNames().forEach(cacheName -> {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                log.debug("Cleared cache: {}", cacheName);
            }
        });
        log.info("All caches evicted successfully");
    }

    @Override
    public void evictUserCaches() {
        log.info("Evicting user-related caches");
        clearSpecificCache("users");
        clearSpecificCache("userDetails");
        clearSpecificCache("pendingDoctors");
        log.info("User caches evicted successfully");
    }

    @Override
    public void evictRoleCaches() {
        log.info("Evicting role-related caches");
        clearSpecificCache("roles");
        log.info("Role caches evicted successfully");
    }

    @Override
    public void evictPrivilegeCaches() {
        log.info("Evicting privilege-related caches");
        clearSpecificCache("privileges");
        log.info("Privilege caches evicted successfully");
    }

    @Override
    public void evictUserCache(Long userId) {
        log.info("Evicting cache for user ID: {}", userId);
        Cache userDetailsCache = cacheManager.getCache("userDetails");
        if (userDetailsCache != null) {
            userDetailsCache.evict(userId);
            log.debug("Evicted userDetails cache for user ID: {}", userId);
        }
        
        // Also clear general user caches as they might contain this user
        clearSpecificCache("users");
        clearSpecificCache("pendingDoctors");
        log.info("User cache evicted for user ID: {}", userId);
    }

    @Override
    public void evictUserByUsername(String username) {
        log.info("Evicting cache for username: {}", username);
        Cache privilegesCache = cacheManager.getCache("privileges");
        if (privilegesCache != null) {
            privilegesCache.evict(username);
            log.debug("Evicted privileges cache for username: {}", username);
        }
        log.info("User cache evicted for username: {}", username);
    }

    @Override
    public void warmUpCaches() {
        log.info("Starting cache warm-up process");
        
        try {
            // Warm up roles cache
            log.debug("Warming up roles cache");
            roleRepository.findAll().forEach(role -> {
                try {
                    roleService.getRoleById(role.getId());
                } catch (Exception e) {
                    log.warn("Failed to warm up role cache for ID {}: {}", role.getId(), e.getMessage());
                }
            });

            // Warm up privileges cache for common roles
            log.debug("Warming up privileges cache");
            for (RoleType roleType : RoleType.values()) {
                try {
                    roleService.getPrivilegesByRole(roleType.name());
                } catch (Exception e) {
                    log.warn("Failed to warm up privileges cache for role {}: {}", roleType, e.getMessage());
                }
            }

            // Warm up pending doctors cache
            log.debug("Warming up pending doctors cache");
            try {
                userService.getPendingDoctorAccounts();
            } catch (Exception e) {
                log.warn("Failed to warm up pending doctors cache: {}", e.getMessage());
            }

            log.info("Cache warm-up completed successfully");
        } catch (Exception e) {
            log.error("Error during cache warm-up: {}", e.getMessage(), e);
        }
    }

    @Override
    public Set<String> getAllCacheNames() {
        return Set.copyOf(cacheManager.getCacheNames());
    }

    @Override
    public void clearSpecificCache(String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
            log.debug("Cleared cache: {}", cacheName);
        } else {
            log.warn("Cache not found: {}", cacheName);
        }
    }

    @Override
    public long getCacheSize(String cacheName) {
        try {
            // For Redis-backed caches, get the approximate size
            Set<String> keys = redisTemplate.keys("healthcare:" + cacheName + ":*");
            return keys != null ? keys.size() : 0;
        } catch (Exception e) {
            log.error("Failed to get cache size for {}: {}", cacheName, e.getMessage());
            return -1;
        }
    }

    // Additional utility methods
    public void evictCacheByPattern(String pattern) {
        log.info("Evicting caches matching pattern: {}", pattern);
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("Deleted {} cache entries matching pattern: {}", keys.size(), pattern);
            }
        } catch (Exception e) {
            log.error("Failed to evict caches by pattern {}: {}", pattern, e.getMessage());
        }
    }

    public Set<String> getAllCacheKeys() {
        try {
            Set<String> keys = redisTemplate.keys("healthcare:*");
            return keys != null ? keys : Set.of();
        } catch (Exception e) {
            log.error("Failed to get all cache keys: {}", e.getMessage());
            return Set.of();
        }
    }

    public void printCacheStats() {
        log.info("=== Cache Statistics ===");
        getAllCacheNames().forEach(cacheName -> {
            long size = getCacheSize(cacheName);
            log.info("Cache: {} - Size: {}", cacheName, size);
        });
        
        long totalKeys = getAllCacheKeys().size();
        log.info("Total Redis keys: {}", totalKeys);
        log.info("========================");
    }
}
