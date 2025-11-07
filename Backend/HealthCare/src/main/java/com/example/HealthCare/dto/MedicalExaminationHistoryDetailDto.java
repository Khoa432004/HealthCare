package com.example.HealthCare.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
@Data
@Builder
public class MedicalExaminationHistoryDetailDto {
    private String id;
    private String patientId;
    private String doctor;
    private String clinic;
    private String doctorMajor;
    private OffsetDateTime date;
    private OffsetDateTime timeIn;
    private OffsetDateTime timeOut;
    private String patientName;
    private String gender;
    private LocalDate birthDateTime;
    private String reason;
    private String diagnosis;
    private List<MedicalReportVitalSignDto> clinicalDiagnosis;
    private String treatment;
    private String notes;
    private List<Prescription> prescriptions; 

    @Data
    @Builder
    @Getter
    public static class Prescription {
        private String name;
        private String dosage;
        private String medicationType;
        private String mealRelation;
        private Integer duration;
        private LocalDate startDay;
        private String note;
    }
    
}
