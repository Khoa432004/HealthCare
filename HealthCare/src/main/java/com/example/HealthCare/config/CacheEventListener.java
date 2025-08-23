package com.example.HealthCare.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.example.HealthCare.service.CacheService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class CacheEventListener {

    private final CacheService cacheService;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("Application is ready, starting cache warm-up");
        try {
            // Delay a bit to ensure all beans are initialized
            Thread.sleep(2000);
            cacheService.warmUpCaches();
            log.info("Cache warm-up completed successfully");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Failed to warm up caches: {}", e.getMessage(), e);
        } catch (RuntimeException e) {
            log.error("Failed to warm up caches: {}", e.getMessage(), e);
        }
    }
}
