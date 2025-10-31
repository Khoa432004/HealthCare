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
public class RefundRequest {
    @NotNull(message = "Payment ID is required")
    private UUID paymentId;
    
    @NotNull(message = "Appointment ID is required")
    private UUID appointmentId;
    
    private String refundReason;
}

