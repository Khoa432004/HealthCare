/**
 * Turn the "Add Measurement" popup form values into the
 * `CreateVitalMeasurementRequest` shape accepted by
 * POST /api/patient-vital-measurements.
 *
 * The popup keeps every numeric field as a string (because react-hook-form +
 * zod strings feed <input type="number"> more reliably), so we parse them
 * here. Only the fields relevant to the selected metric are forwarded; the
 * backend runs its own validation to reject mismatched payloads.
 */

import {
  MetricBloodSugarMeasurement,
  MetricCholesterolMeasurement,
  MetricTimeOfDay,
  MetricType,
} from "../ysalus-metrics/types"
import type {
  CreateVitalMeasurementRequest,
  MeasurementMetricType,
  MeasurementSubType,
} from "@/services/patient-vital-measurement.service"

import type {
  MeasurementContextFormValues,
  NormalizedMeasurement,
} from "./types"

const METRIC_TYPE_MAP: Record<MetricType, MeasurementMetricType | undefined> = {
  [MetricType.BloodPressure]: "BLOOD_PRESSURE",
  [MetricType.BloodSugar]: "BLOOD_SUGAR",
  [MetricType.Cholesterol]: "CHOLESTEROL",
  [MetricType.HeartRate]: "HEART_RATE",
  [MetricType.Hematocrit]: "HEMATOCRIT",
  [MetricType.Hemoglobin]: "HEMOGLOBIN",
  [MetricType.Ketone]: "KETONE",
  [MetricType.UricAcid]: "URIC_ACID",
  [MetricType.Ecg]: undefined,
  [MetricType.Measurement]: undefined,
}

const CHOLESTEROL_SUBTYPE_MAP: Record<
  MetricCholesterolMeasurement,
  MeasurementSubType
> = {
  [MetricCholesterolMeasurement.TotalCholesterol]: "TOTAL_CHOLESTEROL",
  [MetricCholesterolMeasurement.HighDensityLipoprotein]: "HIGH_DENSITY_LIPOPROTEIN",
  [MetricCholesterolMeasurement.LowDensityLipoprotein]: "LOW_DENSITY_LIPOPROTEIN",
  [MetricCholesterolMeasurement.Triglycerides]: "TRIGLYCERIDES",
}

function toNumber(raw: string | undefined | null): number | undefined {
  if (raw === undefined || raw === null) return undefined
  const trimmed = String(raw).trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed.replace(",", "."))
  return Number.isFinite(parsed) ? parsed : undefined
}

function buildTakenAtIso(values: MeasurementContextFormValues): string | undefined {
  const { takenAtDate, takenAtTime } = values
  if (!takenAtDate || !takenAtTime) return undefined
  const local = new Date(`${takenAtDate}T${takenAtTime}:00`)
  if (Number.isNaN(local.getTime())) return undefined
  return local.toISOString()
}

export function mapFormValuesToCreateRequest(
  formValues: MeasurementContextFormValues,
  _result: NormalizedMeasurement,
): CreateVitalMeasurementRequest | null {
  const metricType = formValues.manualMetricType
  if (!metricType) return null

  const backendMetricType = METRIC_TYPE_MAP[metricType]
  if (!backendMetricType) return null

  const base: CreateVitalMeasurementRequest = {
    metricType: backendMetricType,
    source: "MANUAL",
    takenAt: buildTakenAtIso(formValues),
    notes: formValues.notes?.trim() || undefined,
  }

  if (metricType === MetricType.BloodPressure) {
    return {
      ...base,
      systolicValue: toNumber(formValues.systolicValue),
      diastolicValue: toNumber(formValues.diastolicValue),
      pulseValue: toNumber(formValues.pulseValue),
      unit: "mmHg",
    }
  }

  if (metricType === MetricType.BloodSugar) {
    const meal =
      formValues.meal === MetricTimeOfDay.AfterMeal
        ? "AFTER_MEAL"
        : formValues.meal === MetricTimeOfDay.BeforeMeal
          ? "BEFORE_MEAL"
          : undefined
    const measurement =
      formValues.measurement === MetricBloodSugarMeasurement.BloodGlucose
        ? "BLOOD_GLUCOSE"
        : undefined
    return {
      ...base,
      numericValue: toNumber(formValues.bloodSugarValue),
      unit: formValues.unit || "mg/dL",
      meal,
      metricSubType: measurement,
    }
  }

  if (metricType === MetricType.Cholesterol) {
    const measurement = Object.values(MetricCholesterolMeasurement).includes(
      formValues.measurement as MetricCholesterolMeasurement,
    )
      ? (formValues.measurement as MetricCholesterolMeasurement)
      : MetricCholesterolMeasurement.TotalCholesterol

    return {
      ...base,
      numericValue: toNumber(formValues.cholesterolValue),
      unit: "mg/dL",
      metricSubType: CHOLESTEROL_SUBTYPE_MAP[measurement],
    }
  }

  if (metricType === MetricType.HeartRate) {
    return {
      ...base,
      numericValue: toNumber(formValues.heartRateValue),
      unit: "bpm",
    }
  }

  if (metricType === MetricType.UricAcid) {
    return {
      ...base,
      numericValue: toNumber(formValues.uricAcidValue),
      unit: "mg/dL",
    }
  }

  if (metricType === MetricType.Hematocrit) {
    return {
      ...base,
      numericValue: toNumber(formValues.hematocritValue),
      unit: "%",
    }
  }

  if (metricType === MetricType.Hemoglobin) {
    return {
      ...base,
      numericValue: toNumber(formValues.hemoglobinValue),
      unit: "g/dL",
    }
  }

  if (metricType === MetricType.Ketone) {
    return {
      ...base,
      numericValue: toNumber(formValues.ketoneValue),
      unit: formValues.unit || "mmol/L",
    }
  }

  return null
}
