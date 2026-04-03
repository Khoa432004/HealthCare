package com.example.HealthCare.dto.request;

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
public class VideoCallAppointmentRequest {
    @NotNull(message = "appointmentId is required")
    private UUID appointmentId;
}
