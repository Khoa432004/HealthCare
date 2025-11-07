package com.example.HealthCare.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MedicalReportVitalSignDto {
    private String signType;
    private String signValue;    
    private String unit;
}
