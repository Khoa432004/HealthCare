package com.example.HealthCare.enums;

public enum PaymentStatus {
    PENDING("pending"),
    PAID("paid"),
    FAILED("failed"),
    REFUNDED("refunded"),
    PENDING_REFUND("pending_refund");

    private final String value;

    PaymentStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PaymentStatus fromValue(String value) {
        for (PaymentStatus status : PaymentStatus.values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status: " + value);
    }
}
