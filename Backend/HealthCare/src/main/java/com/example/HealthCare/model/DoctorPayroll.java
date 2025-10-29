package com.example.HealthCare.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.HealthCare.enums.PayrollStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "doctor_payroll")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class DoctorPayroll extends BaseEntity {

    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @Column(name = "period_month", nullable = false)
    private Integer periodMonth;

    @Column(name = "period_year", nullable = false)
    private Integer periodYear;

    @Column(name = "gross_amount")
    @lombok.Builder.Default
    private BigDecimal grossAmount = BigDecimal.ZERO;

    @Column(name = "platform_fee")
    @lombok.Builder.Default
    private BigDecimal platformFee = BigDecimal.ZERO;

    @Column(name = "net_amount")
    @lombok.Builder.Default
    private BigDecimal netAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @lombok.Builder.Default
    private PayrollStatus status = PayrollStatus.UNSETTLED;

    @Column(name = "settled_at")
    private OffsetDateTime settledAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    private UserAccount doctor;
}


