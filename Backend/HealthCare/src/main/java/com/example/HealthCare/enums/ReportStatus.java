package com.example.HealthCare.enums;

public enum ReportStatus {
    DRAFT("draft"),
    COMPLETED("completed"),
    completed("completed");

    private final String value;

    ReportStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ReportStatus fromValue(String value) {
        for (ReportStatus status : ReportStatus.values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status: " + value);
    }
}
