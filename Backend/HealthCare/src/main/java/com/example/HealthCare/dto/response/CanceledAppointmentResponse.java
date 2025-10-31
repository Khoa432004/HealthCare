package com.example.HealthCare.dto.response;

import java.math.BigDecimal;
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
public class CanceledAppointmentResponse {
    private UUID appointmentId;
    private OffsetDateTime scheduledStart;
    private OffsetDateTime scheduledEnd;
    private String doctorName;
    private String patientName;
    private String patientPhone;
    private String cancellationReason;
    private OffsetDateTime canceledAt;
    private String appointmentStatus; // scheduled, completed, canceled, in_process
    private String paymentStatus;
    private BigDecimal totalAmount;
    private UUID paymentId;
    private String canceledBy; // "DOCTOR" or "PATIENT"
}

