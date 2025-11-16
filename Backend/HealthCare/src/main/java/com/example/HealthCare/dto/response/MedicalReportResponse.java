package com.example.HealthCare.dto.response;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalReportResponse {
    private UUID id;
    private UUID appointmentId;
    private UUID doctorId;
    private String status;
    private String clinic;
    private String province;
    private String chronicConditions;
    private String illness;
    private String medicalExam;
    private String icdCode;
    private String diagnosis;
    private String coverage;
    private String recommendation;
    private String note;
    private LocalDate followUpDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime completedAt;
    
    private List<VitalSignResponse> vitalSigns;
    private List<MedicationResponse> medications;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VitalSignResponse {
        private UUID id;
        private String signType;
        private String value;
        private String unit;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicationResponse {
        private UUID id;
        private String medicationName;
        private String dosage;
        private String medicationType;
        private String mealRelation;
        private Integer durationDays;
        private LocalDate startDate;
        private String note;
    }
}

