package com.example.HealthCare.enums;

public enum PaymentMethod {
    VNPAY("vnpay"),
    CASH("cash"),
    INSURANCE("insurance");

    private final String value;

    PaymentMethod(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PaymentMethod fromValue(String value) {
        for (PaymentMethod method : PaymentMethod.values()) {
            if (method.value.equals(value)) {
                return method;
            }
        }
        throw new IllegalArgumentException("Unknown method: " + value);
    }
}
