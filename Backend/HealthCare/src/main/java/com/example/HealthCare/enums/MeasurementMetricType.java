package com.example.HealthCare.enums;

/**
 * Top-level family of a patient-reported vital measurement.
 *
 * Mirrors the MetricType values the frontend uses in its "Add Measurement" popup
 * (see ysalus-metrics/types.ts MetricType). We store the enum name so the
 * frontend string keys (e.g. "BloodPressure") match 1:1 with our DB column.
 */
public enum MeasurementMetricType {
    BLOOD_PRESSURE,
    BLOOD_SUGAR,
    CHOLESTEROL,
    HEART_RATE,
    HEMATOCRIT,
    HEMOGLOBIN,
    KETONE,
    URIC_ACID
}
