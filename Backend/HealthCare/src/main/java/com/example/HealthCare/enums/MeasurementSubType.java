package com.example.HealthCare.enums;

/**
 * Optional disambiguator for families that ship multiple metrics.
 *
 * Values intentionally mirror the frontend enums
 * (MetricBloodSugarMeasurement / MetricCholesterolMeasurement in
 * ysalus-metrics/types.ts) so the "Add Measurement" popup can POST the enum
 * name unchanged.
 */
public enum MeasurementSubType {
    BLOOD_GLUCOSE,
    TOTAL_CHOLESTEROL,
    HIGH_DENSITY_LIPOPROTEIN,
    LOW_DENSITY_LIPOPROTEIN,
    TRIGLYCERIDES
}
