package com.example.HealthCare.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.HealthCare.converter.PaymentMethodConverter;
import com.example.HealthCare.converter.PaymentStatusConverter;
import com.example.HealthCare.enums.PaymentMethod;
import com.example.HealthCare.enums.PaymentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class Payment extends BaseEntity {

    @Column(name = "appointment_id", nullable = false, unique = true)
    private UUID appointmentId;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "discount")
    @lombok.Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "tax")
    @lombok.Builder.Default
    private BigDecimal tax = new BigDecimal("0.05");

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Convert(converter = PaymentMethodConverter.class)
    @Column(name = "method", nullable = false)
    private PaymentMethod method;

    @Convert(converter = PaymentStatusConverter.class)
    @Column(name = "status", nullable = false)
    @lombok.Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "payment_time")
    private OffsetDateTime paymentTime;

    @Column(name = "refunded_at")
    private OffsetDateTime refundedAt;

    @Column(name = "refund_reason")
    private String refundReason;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", insertable = false, updatable = false)
    private Appointment appointment;
}
