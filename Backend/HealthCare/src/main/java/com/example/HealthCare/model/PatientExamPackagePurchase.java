package com.example.HealthCare.model;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "patient_exam_package_purchase")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class PatientExamPackagePurchase extends BaseEntity {

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @Column(name = "package_id", nullable = false)
    private UUID packageId;

    @Column(name = "package_name", nullable = false, length = 255)
    private String packageName;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "price_vnd", nullable = false)
    private Long priceVnd;

    @Column(name = "purchase_date", nullable = false)
    private OffsetDateTime purchaseDate;

    @Column(name = "expiration_date")
    private OffsetDateTime expirationDate;

    @Column(name = "status", nullable = false)
    @lombok.Builder.Default
    private String status = "active"; // active, expired, cancelled

    @Column(name = "remaining_messages")
    @lombok.Builder.Default
    private Integer remainingMessages = 12;

    @Column(name = "remaining_sessions")
    @lombok.Builder.Default
    private Integer remainingSessions = 4;

    // Optional relationship to doctor
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    private UserAccount doctor;

    // Optional relationship to patient
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private UserAccount patient;

    // Optional relationship to payment if package is paid
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private PackagePurchasePayment payment;
}
