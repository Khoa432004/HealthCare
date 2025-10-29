package com.example.HealthCare.converter;

import com.example.HealthCare.enums.AccountStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class AccountStatusConverter implements AttributeConverter<AccountStatus, String> {

    @Override
    public String convertToDatabaseColumn(AccountStatus status) {
        if (status == null) {
            return null;
        }
        return status.getValue(); // "pending", "active", "inactive", "suspended"
    }

    @Override
    public AccountStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        return AccountStatus.fromValue(dbData); // "active" -> AccountStatus.ACTIVE
    }
}

