package com.example.HealthCare.enums;

public enum MealRelation {
    BEFORE("before"),
    AFTER("after"),
    WITH("with");

    private final String value;

    MealRelation(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static MealRelation fromValue(String value) {
        for (MealRelation relation : MealRelation.values()) {
            if (relation.value.equals(value)) {
                return relation;
            }
        }
        throw new IllegalArgumentException("Unknown meal relation: " + value);
    }
}
