package com.example.HealthCare.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.HealthCare.enums.MealContext;
import com.example.HealthCare.enums.MeasurementBadge;
import com.example.HealthCare.enums.MeasurementMetricType;
import com.example.HealthCare.enums.MeasurementSource;
import com.example.HealthCare.enums.MeasurementSubType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * Patient-reported vital measurement coming from the "Add Measurement" popup
 * (manual entry today, Bluetooth devices later).
 *
 * This table stores ONE row per measurement submission:
 *   - Blood pressure submissions pack systolic/diastolic/pulse into their
 *     dedicated columns (pulse is optional).
 *   - All other metrics (blood sugar, heart rate, cholesterol...) store their
 *     reading in `numericValue`.
 *
 * Classification (badge + reference_range_label) is computed server-side using
 * the same thresholds as ysalus-source and stored as a snapshot so later
 * threshold tweaks don't rewrite history. Metrics that ysalus does not
 * classify (Hematocrit, Hemoglobin, Ketone) leave badge/rangeLabel null.
 */
@Entity
@Table(
    name = "patient_vital_measurement",
    indexes = {
        @Index(name = "idx_pvm_patient_taken_at", columnList = "patient_id, taken_at"),
        @Index(name = "idx_pvm_patient_metric", columnList = "patient_id, metric_type, taken_at")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class PatientVitalMeasurement extends BaseEntity {

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private UserAccount patient;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", nullable = false, length = 32)
    private MeasurementMetricType metricType;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric_sub_type", length = 32)
    private MeasurementSubType metricSubType;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 16)
    private MeasurementSource source;

    // --- values ----------------------------------------------------------
    /** Populated for BLOOD_PRESSURE submissions. */
    @Column(name = "systolic_value", precision = 6, scale = 2)
    private BigDecimal systolicValue;

    /** Populated for BLOOD_PRESSURE submissions. */
    @Column(name = "diastolic_value", precision = 6, scale = 2)
    private BigDecimal diastolicValue;

    /** Optional pulse captured together with a BP reading. */
    @Column(name = "pulse_value", precision = 6, scale = 2)
    private BigDecimal pulseValue;

    /** Populated for every non-BP metric. */
    @Column(name = "numeric_value", precision = 10, scale = 2)
    private BigDecimal numericValue;

    @Column(name = "unit", length = 16)
    private String unit;

    // --- context --------------------------------------------------------
    @Enumerated(EnumType.STRING)
    @Column(name = "meal", length = 16)
    private MealContext meal;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // --- classification snapshot ----------------------------------------
    @Enumerated(EnumType.STRING)
    @Column(name = "badge", length = 8)
    private MeasurementBadge badge;

    /** Optional badge for the pulse portion of a BP reading. */
    @Enumerated(EnumType.STRING)
    @Column(name = "pulse_badge", length = 8)
    private MeasurementBadge pulseBadge;

    @Column(name = "reference_range_label", length = 64)
    private String referenceRangeLabel;

    // --- timing ---------------------------------------------------------
    @Column(name = "taken_at", nullable = false)
    private OffsetDateTime takenAt;
}
