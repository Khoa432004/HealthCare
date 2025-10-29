package com.example.HealthCare.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileId implements Serializable {
    private UUID userId;
    private String practiceLicenseNo;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DoctorProfileId that = (DoctorProfileId) o;
        return Objects.equals(userId, that.userId) && 
               Objects.equals(practiceLicenseNo, that.practiceLicenseNo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, practiceLicenseNo);
    }
}
