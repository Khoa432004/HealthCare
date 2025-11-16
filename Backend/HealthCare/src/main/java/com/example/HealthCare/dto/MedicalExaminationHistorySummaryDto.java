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
    // UC-17: Additional fields for doctors (full notes, diagnosis, lab details)
    private String diagnosis;  // From medical report - for doctor's diagnostic support
    private String notes;      // From medical report - full notes for doctors
    private OffsetDateTime completedAt;  // When the medical report was completed

}
