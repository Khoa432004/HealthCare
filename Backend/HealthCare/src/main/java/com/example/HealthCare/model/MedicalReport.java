package com.example.HealthCare.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.HealthCare.enums.ReportStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "medical_report")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class MedicalReport extends BaseEntity {

    @Column(name = "appointment_id", nullable = false)
    private UUID appointmentId;

    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @lombok.Builder.Default
    private ReportStatus status = ReportStatus.DRAFT;

    @Column(name = "clinic")
    private String clinic;

    @Column(name = "province")
    private String province;

    @Column(name = "chronic_conditions")
    private String chronicConditions;

    @Column(name = "illness")
    private String illness;

    @Column(name = "medical_exam")
    private String medicalExam;

    @Column(name = "icd_code")
    private String icdCode;

    @Column(name = "diagnosis")
    private String diagnosis;

    @Column(name = "coverage")
    private String coverage;

    @Column(name = "recommendation")
    private String recommendation;

    @Column(name = "note")
    private String note;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", insertable = false, updatable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    private UserAccount doctor;
}
