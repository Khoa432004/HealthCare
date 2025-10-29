package com.example.HealthCare.config;

import java.util.concurrent.Executor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "emailTaskExecutor")
    public Executor emailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2); // Minimum number of threads
        executor.setMaxPoolSize(5);  // Maximum number of threads
        executor.setQueueCapacity(100); // Queue capacity for pending tasks
        executor.setThreadNamePrefix("Email-Async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    @Bean(name = "controllerTaskExecutor")
    public Executor controllerTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10); // Higher core pool for API requests
        executor.setMaxPoolSize(20);  // Maximum number of threads
        executor.setQueueCapacity(500); // Large queue for high throughput
        executor.setThreadNamePrefix("Controller-Async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    @Bean(name = "databaseTaskExecutor")
    public Executor databaseTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5); // Database operations
        executor.setMaxPoolSize(15);  // Maximum number of threads
        executor.setQueueCapacity(200); // Queue capacity for DB operations
        executor.setThreadNamePrefix("Database-Async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    @Bean(name = "cacheTaskExecutor")
    public Executor cacheTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3); // Cache operations
        executor.setMaxPoolSize(8);  // Maximum number of threads
        executor.setQueueCapacity(150); // Queue capacity for cache operations
        executor.setThreadNamePrefix("Cache-Async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
}
