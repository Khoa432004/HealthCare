package com.example.HealthCare.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.HealthCare.service.IcdDataImportService;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class IcdDataImportConfig {

    @Bean
    public CommandLineRunner icdDataImportRunner(IcdDataImportService icdDataImportService) {
        return args -> {
            try {
                int imported = icdDataImportService.importFromCsvIfEmpty();
                if (imported > 0) {
                    log.info("ICD data import completed: {} rows", imported);
                }
            } catch (Exception e) {
                log.error("ICD data import failed on startup", e);
                // Do not fail application startup; data can be imported later via API if needed
            }
        };
    }
}
