package com.example.HealthCare.enums;

public enum PayrollStatus {
    SETTLED("settled"),
    UNSETTLED("unsettled");

    private final String value;

    PayrollStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PayrollStatus fromValue(String value) {
        for (PayrollStatus status : PayrollStatus.values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown payroll status: " + value);
    }
}


