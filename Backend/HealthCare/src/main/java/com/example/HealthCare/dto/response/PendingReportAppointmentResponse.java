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
public class PendingReportAppointmentResponse {
    private UUID appointmentId;
    private String patientName;
    private String patientPhone;
    private OffsetDateTime scheduledStart;
    private String status; // IN_PROCESS
    private UUID medicalReportId; // For navigation to UC-06
}

