package com.example.HealthCare.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

import com.example.HealthCare.enums.MealContext;
import com.example.HealthCare.enums.MeasurementBadge;
import com.example.HealthCare.enums.MeasurementSubType;

/**
 * Ports the classification logic living in
 * ysalus-source/ysalus-web/src/features/my-dashboard/components/add-measurement-popup/config.ts
 * to the backend.
 *
 * The popup in ysalus computes a 1..6 severity, then maps it to LOW/NORMAL/HIGH
 * for the badge pill. We short-circuit that here: we go straight from the raw
 * reading to a MeasurementBadge because the DB only stores the 3-state
 * classification snapshot.
 *
 * Metrics that ysalus does NOT classify (Hematocrit, Hemoglobin, Ketone) are
 * not handled: callers must leave the badge/rangeLabel null for them.
 */
@Component
public class MeasurementClassifier {

    // Ranges copied verbatim from ysalus config.ts.
    private static final double HEART_RATE_MIN = 60;
    private static final double HEART_RATE_MAX = 100;

    private static final double BLOOD_GLUCOSE_MGDL_MIN = 70;

    private static final double URIC_ACID_MGDL_MIN = 3.5;
    private static final double URIC_ACID_MGDL_MAX = 7.2;

    private static final double TOTAL_CHOLESTEROL_MAX_MGDL = 200;
    private static final double TRIGLYCERIDES_MAX_MGDL = 150;
    private static final double HDL_MIN_MGDL = 40;
    private static final double LDL_MAX_MGDL = 100;

    private static final String BP_RANGE_LABEL = "90-120/60-80 mmHg";
    private static final String HR_RANGE_LABEL = "60-100 bpm";
    private static final String URIC_ACID_RANGE_LABEL = "3.5-7.2 mg/dL";
    private static final String BG_RANGE_MGDL = "70-140 mg/dL";
    private static final String BG_RANGE_MMOL = "3.9-7.8 mmol/L";

    public ClassificationResult classifyBloodPressure(
        BigDecimal systolic, BigDecimal diastolic, BigDecimal pulse
    ) {
        double sys = systolic.doubleValue();
        double dia = diastolic.doubleValue();
        Double p = pulse == null ? null : pulse.doubleValue();

        // Mirrors resolveP80Severity: high from lv3-lv6, low from lv1, normal at lv2.
        if (sys >= 160 || dia >= 100) return highBp();
        if (sys >= 140 || dia >= 90) return highBp();
        if (sys >= 130 || dia >= 80) return highBp();
        if (sys >= 120 || (p != null && p > HEART_RATE_MAX)) return highBp();
        if (sys < 90 || dia < 60 || (p != null && p < HEART_RATE_MIN)) return lowBp();
        return normalBp();
    }

    public MeasurementBadge classifyPulse(BigDecimal pulse) {
        if (pulse == null) return null;
        double value = pulse.doubleValue();
        if (value < HEART_RATE_MIN) return MeasurementBadge.LOW;
        if (value > HEART_RATE_MAX) return MeasurementBadge.HIGH;
        return MeasurementBadge.NORMAL;
    }

    public ClassificationResult classifyHeartRate(BigDecimal heartRate) {
        MeasurementBadge badge = classifyPulse(heartRate);
        return new ClassificationResult(badge, HR_RANGE_LABEL);
    }

    public ClassificationResult classifyBloodGlucose(
        BigDecimal value, String unit, MealContext meal
    ) {
        double raw = value.doubleValue();
        boolean isMmol = "mmol/L".equalsIgnoreCase(unit);
        double mgdl = isMmol ? Math.round(raw * 18.0) : raw;
        boolean afterMeal = meal == MealContext.AFTER_MEAL;
        double normalMax = afterMeal ? 140 : 99;

        MeasurementBadge badge;
        if (mgdl < BLOOD_GLUCOSE_MGDL_MIN) {
            badge = MeasurementBadge.LOW;
        } else if (mgdl <= normalMax) {
            badge = MeasurementBadge.NORMAL;
        } else {
            badge = MeasurementBadge.HIGH;
        }
        return new ClassificationResult(badge, isMmol ? BG_RANGE_MMOL : BG_RANGE_MGDL);
    }

    public ClassificationResult classifyUricAcid(BigDecimal value, String unit) {
        // ysalus only classifies when unit is mg/dL; otherwise severity is undefined.
        if (!"mg/dL".equalsIgnoreCase(unit)) {
            return new ClassificationResult(null, URIC_ACID_RANGE_LABEL);
        }
        double raw = value.doubleValue();
        MeasurementBadge badge;
        if (raw < URIC_ACID_MGDL_MIN) badge = MeasurementBadge.LOW;
        else if (raw <= URIC_ACID_MGDL_MAX) badge = MeasurementBadge.NORMAL;
        else badge = MeasurementBadge.HIGH;
        return new ClassificationResult(badge, URIC_ACID_RANGE_LABEL);
    }

    public ClassificationResult classifyCholesterol(
        MeasurementSubType subType, BigDecimal value, String unit
    ) {
        // ysalus classification is only defined for mg/dL.
        if (subType == null || !"mg/dL".equalsIgnoreCase(unit)) {
            return new ClassificationResult(null, null);
        }
        double raw = value.doubleValue();

        return switch (subType) {
            case HIGH_DENSITY_LIPOPROTEIN -> new ClassificationResult(
                raw < HDL_MIN_MGDL ? MeasurementBadge.LOW : MeasurementBadge.NORMAL,
                "HDL >= 40 mg/dL"
            );
            case TOTAL_CHOLESTEROL -> new ClassificationResult(
                raw <= TOTAL_CHOLESTEROL_MAX_MGDL
                    ? MeasurementBadge.NORMAL
                    : MeasurementBadge.HIGH,
                "< 200 mg/dL"
            );
            case TRIGLYCERIDES -> new ClassificationResult(
                raw < TRIGLYCERIDES_MAX_MGDL
                    ? MeasurementBadge.NORMAL
                    : MeasurementBadge.HIGH,
                "< 150 mg/dL"
            );
            case LOW_DENSITY_LIPOPROTEIN -> new ClassificationResult(
                raw < LDL_MAX_MGDL
                    ? MeasurementBadge.NORMAL
                    : MeasurementBadge.HIGH,
                "< 100 mg/dL"
            );
            default -> new ClassificationResult(null, null);
        };
    }

    private ClassificationResult highBp() {
        return new ClassificationResult(MeasurementBadge.HIGH, BP_RANGE_LABEL);
    }

    private ClassificationResult lowBp() {
        return new ClassificationResult(MeasurementBadge.LOW, BP_RANGE_LABEL);
    }

    private ClassificationResult normalBp() {
        return new ClassificationResult(MeasurementBadge.NORMAL, BP_RANGE_LABEL);
    }

    public record ClassificationResult(MeasurementBadge badge, String rangeLabel) {
        public static ClassificationResult empty() {
            return new ClassificationResult(null, null);
        }
    }
}
