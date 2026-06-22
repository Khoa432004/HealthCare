package com.example.HealthCare.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow frontend origins (Web)
        // Allow React Native app origins (Mobile)
        // Note: In production, restrict these patterns for security
        configuration.setAllowedOriginPatterns(Arrays.asList(
            // ---- Local development ----
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://localhost:3000",
            "http://localhost:*",
            "http://127.0.0.1:*",
            // ---- React Native (Android Emulator / Physical) ----
            "http://10.0.2.2:*",
            "http://192.168.*.*:*",
            "http://10.0.*.*:*",
            // ---- Vercel Production & Preview deploys ----
            "https://*.vercel.app",
            // ---- Render (BE gọi chính nó nếu cần) ----
            "https://healthcare-spdk.onrender.com"
        ));
        
        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Allow credentials (cookies, authorization headers, etc.)
        configuration.setAllowCredentials(true);
        
        // Expose headers
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Max age for preflight requests (1 hour)
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}

