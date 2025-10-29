package com.example.HealthCare.enums;

public enum RoleType {
	DOCTOR("doctor"),
	ADMIN("admin"),
	PATIENT("patient");

	private final String value;

	RoleType(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public static RoleType fromValue(String value) {
		for (RoleType role : RoleType.values()) {
			if (role.value.equals(value)) {
				return role;
			}
		}
		throw new IllegalArgumentException("Unknown role: " + value);
	}
}
