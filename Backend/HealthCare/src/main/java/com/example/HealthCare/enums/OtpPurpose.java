package com.example.HealthCare.enums;

public enum OtpPurpose {
    PASSWORD_RESET("password_reset"),
    LOGIN_MFA("login_mfa"),
    EMAIL_VERIFY("email_verify");

    private final String value;

    OtpPurpose(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static OtpPurpose fromValue(String value) {
        for (OtpPurpose purpose : OtpPurpose.values()) {
            if (purpose.value.equals(value)) {
                return purpose;
            }
        }
        throw new IllegalArgumentException("Unknown purpose: " + value);
    }
}
