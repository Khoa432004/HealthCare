package com.example.HealthCare.model;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.HealthCare.enums.AppointmentStatus;

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
@Table(name = "appointment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class Appointment extends BaseEntity {

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @lombok.Builder.Default
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(name = "scheduled_start", nullable = false)
    private OffsetDateTime scheduledStart;

    @Column(name = "scheduled_end", nullable = false)
    private OffsetDateTime scheduledEnd;

    @Column(name = "reason")
    private String reason;

    @Column(name = "symptoms_ons")
    private String symptomsOns;

    @Column(name = "symptoms_sever")
    private String symptomsSever;

    @Column(name = "current_medication")
    private String currentMedication;

    @Column(name = "notes")
    private String notes;

    @Column(name = "consent", nullable = false)
    @lombok.Builder.Default
    private Boolean consent = false;

    @Column(name = "rescheduled_from_id")
    private UUID rescheduledFromId;

    @Column(name = "canceled_at")
    private OffsetDateTime canceledAt;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "title")
    private String title;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "ended_at")
    private OffsetDateTime endedAt;

    @Column(name = "cancellation_by")
    private String cancellationBy;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Column(name = "holding_until")
    private OffsetDateTime holdingUntil;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private UserAccount patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    private UserAccount doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rescheduled_from_id", insertable = false, updatable = false)
    private Appointment rescheduledFrom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private UserAccount createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by", insertable = false, updatable = false)
    private UserAccount updatedByUser;
}
