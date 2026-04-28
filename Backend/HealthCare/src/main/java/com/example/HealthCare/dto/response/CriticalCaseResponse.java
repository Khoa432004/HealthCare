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
public class CriticalCaseResponse {
    private UUID patientId;
    private String patientName;
    private String metricType;
    private String result;
    private String status;
    private String mealTime;
    private OffsetDateTime takenAt;
}
