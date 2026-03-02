package com.example.HealthCare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IcdDiseaseSearchItemDto {
    private String icdCode;
    private String diseaseName;
}
