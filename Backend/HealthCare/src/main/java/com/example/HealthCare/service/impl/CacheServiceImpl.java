package com.example.HealthCare.service.impl;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.example.HealthCare.enums.RoleType;
import com.example.HealthCare.repository.RoleRepository;
import com.example.HealthCare.service.CacheService;
import com.example.HealthCare.service.RoleService;
import com.example.HealthCare.service.UserService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CacheServiceImpl implements CacheService {

    private final CacheManager cacheManager;
    
    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;
    
    private final UserService userService;
    private final RoleService roleService;
    private final RoleRepository roleRepository;
    
    public CacheServiceImpl(CacheManager cacheManager, UserService userService, 
                           RoleService roleService, RoleRepository roleRepository) {
        this.cacheManager = cacheManager;
        this.userService = userService;
        this.roleService = roleService;
        this.roleRepository = roleRepository;
    }

    @Override
    public void evictAllCaches() {
        cacheManager.getCacheNames().forEach(cacheName -> {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
            }
        });
    }

    @Override
    public void evictUserCaches() {
        clearSpecificCache("users");
        clearSpecificCache("userDetails");
        clearSpecificCache("pendingDoctors");
    }

    @Override
    public void evictRoleCaches() {
        clearSpecificCache("roles");
    }

    @Override
    public void evictPrivilegeCaches() {
        clearSpecificCache("privileges");
    }

    @Override
    public void evictUserCache(Long userId) {
        Cache userDetailsCache = cacheManager.getCache("userDetails");
        if (userDetailsCache != null) {
            userDetailsCache.evict(userId);
        }
        clearSpecificCache("users");
        clearSpecificCache("pendingDoctors");
    }

    @Override
    public void evictUserByUsername(String username) {
        Cache privilegesCache = cacheManager.getCache("privileges");
        if (privilegesCache != null) {
            privilegesCache.evict(username);
        }
    }

    @Override
    public void warmUpCaches() {
        try {
            roleRepository.findAll().forEach(role -> {
                try {
                    roleService.getRoleById(role.getId());
                } catch (Exception e) {
                    log.error("Failed to warm up role cache for ID {}: {}", role.getId(), e.getMessage());
                }
            });

            for (RoleType roleType : RoleType.values()) {
                try {
                    roleService.getPrivilegesByRole(roleType.name());
                } catch (Exception e) {
                    log.error("Failed to warm up privileges cache for role {}: {}", roleType, e.getMessage());
                }
            }

            try {
                userService.getPendingDoctorAccounts();
            } catch (Exception e) {
                log.error("Failed to warm up pending doctors cache: {}", e.getMessage());
            }
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
        }
    }

    @Override
    public long getCacheSize(String cacheName) {
        if (redisTemplate == null) {
            return -1;
        }
        
        try {
            Set<String> keys = redisTemplate.keys("healthcare:" + cacheName + ":*");
            return keys != null ? keys.size() : 0;
        } catch (Exception e) {
            log.error("Failed to get cache size for {}: {}", cacheName, e.getMessage());
            return -1;
        }
    }

    public void evictCacheByPattern(String pattern) {
        if (redisTemplate == null) {
            return;
        }
        
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.error("Failed to evict caches by pattern {}: {}", pattern, e.getMessage());
        }
    }

    public Set<String> getAllCacheKeys() {
        if (redisTemplate == null) {
            return Set.of();
        }
        
        try {
            Set<String> keys = redisTemplate.keys("healthcare:*");
            return keys != null ? keys : Set.of();
        } catch (Exception e) {
            log.error("Failed to get all cache keys: {}", e.getMessage());
            return Set.of();
        }
    }

    public void printCacheStats() {
    }
}
