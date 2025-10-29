package com.example.HealthCare.model;

import java.time.LocalDate;
import java.util.UUID;

import com.example.HealthCare.enums.MealRelation;

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
@Table(name = "medical_report_medication")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class MedicalReportMedication extends BaseEntity {

    @Column(name = "medical_report_id", nullable = false)
    private UUID medicalReportId;

    @Column(name = "medication_name", nullable = false)
    private String medicationName;

    @Column(name = "dosage", nullable = false)
    private String dosage;

    @Column(name = "medication_type", nullable = false)
    private String medicationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_relation", nullable = false)
    private MealRelation mealRelation;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "note")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_report_id", insertable = false, updatable = false)
    private MedicalReport medicalReport;
}
