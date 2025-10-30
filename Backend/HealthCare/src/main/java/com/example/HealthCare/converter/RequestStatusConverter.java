package com.example.HealthCare.converter;

import com.example.HealthCare.enums.RequestStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RequestStatusConverter implements AttributeConverter<RequestStatus, String> {

    @Override
    public String convertToDatabaseColumn(RequestStatus status) {
        if (status == null) {
            return null;
        }
        return status.getValue(); // "pending", "approved", "rejected"
    }

    @Override
    public RequestStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        return RequestStatus.fromValue(dbData); // "pending" -> RequestStatus.PENDING
    }
}

