package com.example.HealthCare.config;

import java.util.concurrent.Executor;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableAsync
@RequiredArgsConstructor
public class WebAsyncConfig implements WebMvcConfigurer, AsyncConfigurer {

    private final AsyncConfig asyncConfig;

    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        // Configure async support for Spring MVC
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("WebMvc-Async-");
        executor.initialize();
        
        configurer.setTaskExecutor(executor);
        configurer.setDefaultTimeout(30000); // 30 seconds timeout
    }

    @Override
    public Executor getAsyncExecutor() {
        return asyncConfig.controllerTaskExecutor();
    }
}
