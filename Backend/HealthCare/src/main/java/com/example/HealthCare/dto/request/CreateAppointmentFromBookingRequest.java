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
public class CreateAppointmentFromBookingRequest {
    @NotNull(message = "Doctor ID is required")
    private UUID doctorId;
    
    @NotNull(message = "Scheduled start time is required")
    private OffsetDateTime scheduledStart;
    
    @NotNull(message = "Scheduled end time is required")
    private OffsetDateTime scheduledEnd;
    
    private String reason;
    private String symptomsOns;
    private String symptomsSever;
    private String currentMedication;
    
    // Optional payment fields (if provided, server will persist a Payment record)
    private java.math.BigDecimal totalAmount;
    private String method; // e.g., "vnpay"
    private String status; // e.g., "paid"
    private String transactionId;
    private String transactionRef;
    private OffsetDateTime paymentTime;
}
