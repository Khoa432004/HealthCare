package com.example.HealthCare.dto.request;

import java.time.OffsetDateTime;
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
public class CreateAppointmentRequest {
    @NotNull(message = "Patient ID is required")
    private UUID patientId;
    
    @NotNull(message = "Scheduled start time is required")
    private OffsetDateTime scheduledStart;
    
    @NotNull(message = "Scheduled end time is required")
    private OffsetDateTime scheduledEnd;
    
    private String title; // Optional - will be auto-generated if not provided
    private String reason;
    private String symptomsOns;
    private String symptomsSever;
    private String currentMedication;
    private String notes;
}

