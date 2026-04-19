package com.example.HealthCare.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.example.HealthCare.dto.request.CreateVitalMeasurementRequest;
import com.example.HealthCare.dto.response.VitalMeasurementResponse;
import com.example.HealthCare.dto.response.VitalMetricPointResponse;

public interface PatientVitalMeasurementService {

    /** Persist a new self-reported measurement for the given patient. */
    VitalMeasurementResponse create(UUID patientId, CreateVitalMeasurementRequest request);

    /** All self-reported measurements for a patient, oldest first. */
    List<VitalMeasurementResponse> listForPatient(UUID patientId);

    /**
     * Combined feed of report-sourced vital signs and self-reported
     * measurements for a patient, normalized to the frontend's
     * `MedicalVitalMetricPoint` shape. Used by the chart in the "Metrics" tab.
     */
    List<VitalMetricPointResponse> listVitalMetricPoints(UUID patientId);

    /** Optional range-restricted variant, kept for future chart filters. */
    List<VitalMetricPointResponse> listVitalMetricPointsInRange(
        UUID patientId, OffsetDateTime from, OffsetDateTime to);
}
