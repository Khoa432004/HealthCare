package com.example.HealthCare.dto.request;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMedicalReportRequest {
    
    @NotNull(message = "Appointment ID is required")
    private UUID appointmentId;
    
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
    
    private List<VitalSignRequest> vitalSigns;
    private List<MedicationRequest> medications;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VitalSignRequest {
        private String signType;
        private String value;
        private String unit;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicationRequest {
        @NotNull(message = "Medication name is required")
        private String medicationName;
        
        @NotNull(message = "Dosage is required")
        private String dosage;
        
        @NotNull(message = "Medication type is required")
        private String medicationType;
        
        @NotNull(message = "Meal relation is required")
        private String mealRelation; // before-meal, with-food, after-meal, anytime
        
        private Integer durationDays;
        private LocalDate startDate;
        private String note;
    }
}

