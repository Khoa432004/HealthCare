package com.example.HealthCare.converter;

import java.sql.Array;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class StringListConverter implements AttributeConverter<List<String>, Array> {

    @Override
    public Array convertToDatabaseColumn(List<String> attribute) {
        // This will be handled by Hibernate automatically for PostgreSQL arrays
        return null;
    }

    @Override
    public List<String> convertToEntityAttribute(Array dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            String[] array = (String[]) dbData.getArray();
            return array != null ? Arrays.asList(array) : null;
        } catch (SQLException e) {
            throw new RuntimeException("Error converting array from database", e);
        }
    }
}

