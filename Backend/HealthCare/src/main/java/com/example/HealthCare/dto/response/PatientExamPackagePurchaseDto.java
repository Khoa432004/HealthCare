package com.example.HealthCare.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Data;

@Data
public class PatientExamPackagePurchaseDto {
    private UUID id;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private UUID patientId;
    private UUID doctorId;
    private UUID packageId;
    private String packageName;
    private Integer durationDays;
    private Long priceVnd;
    private OffsetDateTime purchaseDate;
    private OffsetDateTime expirationDate;
    private String status;
    private Integer remainingMessages;
    private Integer remainingSessions;
    private DoctorSummaryDto doctor;
    private PatientSummaryDto patient;
    private PaymentDto payment;
}
