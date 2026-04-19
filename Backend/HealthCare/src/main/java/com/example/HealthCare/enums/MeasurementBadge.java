package com.example.HealthCare.enums;

/**
 * Classification snapshot persisted alongside each measurement.
 *
 * Derived from the ysalus severity ladder (lv1..lv6):
 *   lv1 -> LOW
 *   lv2 -> NORMAL
 *   lv3..lv6 -> HIGH
 *
 * The badge is nullable for metrics that ysalus does not classify
 * (Hematocrit, Hemoglobin, Ketone).
 */
public enum MeasurementBadge {
    LOW,
    NORMAL,
    HIGH
}
