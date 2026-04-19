package com.example.HealthCare.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.HealthCare.enums.MealContext;
import com.example.HealthCare.enums.MeasurementBadge;
import com.example.HealthCare.enums.MeasurementMetricType;
import com.example.HealthCare.enums.MeasurementSource;
import com.example.HealthCare.enums.MeasurementSubType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Full representation of one patient_vital_measurement row. Used as the
 * response for POST /api/patient-vital-measurements and by any future
 * "measurement history" view that wants to surface badges / meal context.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalMeasurementResponse {
    private UUID id;
    private UUID patientId;
    private MeasurementMetricType metricType;
    private MeasurementSubType metricSubType;
    private MeasurementSource source;
    private BigDecimal systolicValue;
    private BigDecimal diastolicValue;
    private BigDecimal pulseValue;
    private BigDecimal numericValue;
    private String unit;
    private MealContext meal;
    private String notes;
    private MeasurementBadge badge;
    private MeasurementBadge pulseBadge;
    private String referenceRangeLabel;
    private OffsetDateTime takenAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
