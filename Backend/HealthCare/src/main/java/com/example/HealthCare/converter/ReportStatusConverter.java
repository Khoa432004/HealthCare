package com.example.HealthCare.converter;

import com.example.HealthCare.enums.ReportStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ReportStatusConverter implements AttributeConverter<ReportStatus, String> {

    @Override
    public String convertToDatabaseColumn(ReportStatus status) {
        if (status == null) {
            return null;
        }
        // Database stores enum name (COMPLETED) not value (completed)
        // Return enum name to match existing database data
        return status.name(); // "DRAFT", "COMPLETED"
    }

    @Override
    public ReportStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        // Handle both enum name (COMPLETED) and value (completed) for backward compatibility
        // First try to find by value (lowercase) - this is the standard way
        try {
            return ReportStatus.fromValue(dbData.toLowerCase());
        } catch (IllegalArgumentException e) {
            // If not found by value, try to find by enum name (uppercase) for backward compatibility
            // Database might have stored "COMPLETED" (enum name) instead of "completed" (value)
            try {
                String upperCase = dbData.toUpperCase();
                // Try to match enum name
                for (ReportStatus status : ReportStatus.values()) {
                    if (status.name().equals(upperCase)) {
                        return status;
                    }
                }
                // If still not found, throw exception
                throw new IllegalArgumentException("Unknown ReportStatus: " + dbData);
            } catch (Exception ex) {
                throw new IllegalArgumentException("Unknown ReportStatus: " + dbData, ex);
            }
        }
    }
}

