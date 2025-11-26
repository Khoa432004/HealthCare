package com.example.HealthCare.dto.request;

import java.math.BigDecimal;
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
public class CreatePaymentRequest {
    @NotNull
    private UUID appointmentId;

    @NotNull
    private BigDecimal totalAmount;

    private String method; // e.g., "vnpay"
    private String status; // e.g., "paid"
    private OffsetDateTime paymentTime;
    private String transactionId;
    private String transactionRef;
}
