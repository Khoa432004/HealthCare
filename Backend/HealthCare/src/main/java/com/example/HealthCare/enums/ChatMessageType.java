package com.example.HealthCare.enums;

public enum ChatMessageType {
	TEXT,
	IMAGE,
	VIDEO,
	MIX;

	public String toJsonValue() {
		return name().toLowerCase();
	}

	public static ChatMessageType fromClient(String raw) {
		if (raw == null || raw.isBlank()) {
			return TEXT;
		}
		return switch (raw.toLowerCase()) {
			case "image" -> IMAGE;
			case "video" -> VIDEO;
			case "mix" -> MIX;
			default -> TEXT;
		};
	}
}
