package com.example.HealthCare.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private UUID id;
    private UUID patientId;
    private UUID doctorId;
    private String status; // SCHEDULED, CANCELED, COMPLETED, IN_PROCESS
    private OffsetDateTime scheduledStart;
    private OffsetDateTime scheduledEnd;
    private String title;
    private String reason;
    private String symptomsOns;
    private String symptomsSever;
    private String currentMedication;
    private String notes;
    
    // Patient info
    private String patientName;
    private String patientFullName;
    private String patientGender;
    
    // Doctor info
    private String doctorName;
    private String doctorFullName;
    private String doctorGender;
}

