package com.example.HealthCare.converter;

import com.example.HealthCare.enums.PayrollStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PayrollStatusConverter implements AttributeConverter<PayrollStatus, String> {
    @Override
    public String convertToDatabaseColumn(PayrollStatus status) {
        if (status == null) {
            return null;
        }
        return status.getValue();
    }

    @Override
    public PayrollStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        return PayrollStatus.fromValue(dbData);
    }
}

