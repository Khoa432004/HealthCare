package com.example.HealthCare.dto;

import java.time.OffsetDateTime;

import lombok.Builder;
import lombok.Data;
@Data
@Builder
public class MedicalExaminationHistorySummaryDto {
    
    private String id;
    private String patientId;
    private String doctor;
    private OffsetDateTime date;
    private String reason;
    private String clinic;

}
