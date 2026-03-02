package com.example.HealthCare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IcdMedicationItemDto {
    private String medicationName;
    private String medicationType;
    private String dosage;
    private String medicationGroup;
    private String role;
}
