package com.example.HealthCare.dto.response;

import com.example.HealthCare.enums.MeasurementBadge;
import com.example.HealthCare.enums.MeasurementSource;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Flat vital-metric point emitted by
 * GET /api/medicalexaminationhistory/{patientId}/vital-metrics.
 *
 * Shape matches the frontend `MedicalVitalMetricPoint` interface consumed by
 * `adapter.ts` so the chart keeps working without any change. Optional fields
 * (source, badge, ...) are opt-in enrichments for new UI.
 *
 * One point == one "signType"; a BP row stored as 120/80 emits a single point
 * with value "120/80" and, if pulse was recorded, a second point with
 * signType = "Heart rate". See also the existing mock in
 * frontend/services/patient-vital-metrics.service.ts.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalMetricPointResponse {
    /** ISO-8601 UTC. Frontend passes it straight into `new Date(...)`. */
    private String measuredAt;

    /**
     * For report-sourced rows this is the appointment id. For self-reported
     * measurements we reuse the measurement UUID so the adapter groups
     * points from the same submission into one visit card.
     */
    private String appointmentId;

    /** Human-readable sign type (e.g. "Blood pressure", "Heart rate"). */
    private String signType;

    /** Raw value. BP is "systolic/diastolic"; everything else is numeric. */
    private String value;

    private String unit;

    // --- Optional enrichment (null when coming from the legacy vital-sign table)

    private MeasurementSource source;

    /** e.g. "HDL_CHOLESTEROL" when the sign is a cholesterol sub-metric. */
    private String subType;

    private MeasurementBadge badge;

    private String rangeLabel;

    /** Only set for blood sugar points captured with a meal context. */
    private String meal;
}
