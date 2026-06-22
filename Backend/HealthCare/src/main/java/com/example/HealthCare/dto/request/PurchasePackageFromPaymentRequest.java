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
public class PurchasePackageFromPaymentRequest {
    @NotNull(message = "Doctor ID is required")
    private UUID doctorId;

    @NotNull(message = "Package ID is required")
    private UUID packageId;

    @NotNull(message = "Package name is required")
    private String packageName;

    @NotNull(message = "Price is required")
    private Long priceVnd;

    @NotNull(message = "Duration days is required")
    private Integer durationDays;

    // Optional payment fields (if provided, server will persist a PackagePurchasePayment record)
    private BigDecimal totalAmount;
    private String method; // e.g., "vnpay"
    private String status; // e.g., "paid"
    private String transactionId;
    private String transactionRef;
    private OffsetDateTime paymentTime;
}
