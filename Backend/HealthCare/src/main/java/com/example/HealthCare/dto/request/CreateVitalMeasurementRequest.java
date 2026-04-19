package com.example.HealthCare.dto.request;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import com.example.HealthCare.enums.MealContext;
import com.example.HealthCare.enums.MeasurementMetricType;
import com.example.HealthCare.enums.MeasurementSource;
import com.example.HealthCare.enums.MeasurementSubType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload accepted by POST /api/patient-vital-measurements.
 *
 * Shape mirrors what the "Add Measurement" popup captures: a metric type plus
 * whichever value columns make sense for that type. Validation of "the right
 * columns are filled for the right metric" is done server-side in the service
 * so clients can keep the request loose.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateVitalMeasurementRequest {

    @NotNull(message = "metricType is required")
    private MeasurementMetricType metricType;

    private MeasurementSubType metricSubType;

    /** Defaults to MANUAL on the backend when omitted. */
    private MeasurementSource source;

    // Values — caller fills only the ones relevant to metricType.
    private BigDecimal systolicValue;
    private BigDecimal diastolicValue;
    private BigDecimal pulseValue;
    private BigDecimal numericValue;

    @Size(max = 16, message = "unit must not exceed 16 characters")
    private String unit;

    private MealContext meal;

    @Size(max = 2000, message = "notes must not exceed 2000 characters")
    private String notes;

    /** When omitted, server stamps "now". */
    private OffsetDateTime takenAt;
}
