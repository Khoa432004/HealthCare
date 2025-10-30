package com.example.HealthCare.converter;

import com.example.HealthCare.enums.PaymentMethod;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PaymentMethodConverter implements AttributeConverter<PaymentMethod, String> {

    @Override
    public String convertToDatabaseColumn(PaymentMethod method) {
        if (method == null) {
            return null;
        }
        return method.getValue(); // "vnpay", "cash", "insurance"
    }

    @Override
    public PaymentMethod convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        return PaymentMethod.fromValue(dbData); // "vnpay" -> PaymentMethod.VNPAY
    }
}

