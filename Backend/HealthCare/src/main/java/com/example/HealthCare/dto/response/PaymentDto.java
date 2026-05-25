package com.example.HealthCare.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Data;

@Data
public class PaymentDto {
    private UUID id;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private UUID packagePurchaseId;
    private BigDecimal amount;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal totalAmount;
    private String method;
    private String status;
    private String transactionId;
    private String transactionRef;
    private OffsetDateTime paymentTime;
}
