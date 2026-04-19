package com.example.HealthCare.enums;

/**
 * Where this measurement came from. MANUAL is the only supported source in the
 * first iteration of the "Add Measurement" popup because the FORA BLE SDK is
 * not available in HealthCare yet. DEVICE is reserved for a future release.
 */
public enum MeasurementSource {
    MANUAL,
    DEVICE
}
