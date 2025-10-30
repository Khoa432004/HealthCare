package com.example.HealthCare.converter;

import com.example.HealthCare.enums.PaymentStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PaymentStatusConverter implements AttributeConverter<PaymentStatus, String> {

    @Override
    public String convertToDatabaseColumn(PaymentStatus status) {
        if (status == null) {
            return null;
        }
        return status.getValue(); // "pending", "paid", "failed", "refunded", "pending_refund"
    }

    @Override
    public PaymentStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        return PaymentStatus.fromValue(dbData); // "paid" -> PaymentStatus.PAID
    }
}

