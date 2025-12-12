package com.example.HealthCare.dto.request;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleAppointmentRequest {
    @NotNull(message = "New scheduled start time is required")
    private OffsetDateTime scheduledStart;
    
    @NotNull(message = "New scheduled end time is required")
    private OffsetDateTime scheduledEnd;
}

