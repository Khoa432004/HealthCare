package com.example.HealthCare.converter;

import com.example.HealthCare.enums.AppointmentStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class AppointmentStatusConverter implements AttributeConverter<AppointmentStatus, String> {

    @Override
    public String convertToDatabaseColumn(AppointmentStatus status) {
        if (status == null) {
            return null;
        }
        return status.getValue(); // "scheduled", "canceled", "completed", "in_process"
    }

    @Override
    public AppointmentStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        return AppointmentStatus.fromValue(dbData); // "scheduled" -> AppointmentStatus.SCHEDULED
    }
}

