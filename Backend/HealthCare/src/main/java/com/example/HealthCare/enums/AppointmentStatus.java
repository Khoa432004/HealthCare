package com.example.HealthCare.enums;

public enum AppointmentStatus {
    SCHEDULED("scheduled"),
    CANCELED("canceled"),
    COMPLETED("completed"),
    completed("completed"),
    IN_PROCESS("in_process");

    private final String value;

    AppointmentStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static AppointmentStatus fromValue(String value) {
        for (AppointmentStatus status : AppointmentStatus.values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status: " + value);
    }
}
