import { MetricType } from "../ysalus-metrics/types"

export type MetricsPrimaryTab = "all" | MetricType
export type MetricsGranularity = "week" | "month" | "year"

/**
 * Order of the category tabs at the top of `PatientMetricsSection`.
 * `ecg` is intentionally omitted in HealthCare (no ECG hardware/data yet).
 */
export const METRICS_PRIMARY_TAB_VALUES: MetricsPrimaryTab[] = [
  "all",
  MetricType.BloodSugar,
  MetricType.BloodPressure,
  MetricType.HeartRate,
  MetricType.Hematocrit,
  MetricType.Hemoglobin,
  MetricType.Ketone,
  MetricType.Cholesterol,
  MetricType.UricAcid,
]

export const GRANULARITY_VALUES: MetricsGranularity[] = [
  "week",
  "month",
  "year",
]

/**
 * Rows shown in the `MetricsHeatmapChart` (tab "all"). Order matters — it's
 * the vertical order of rows top-to-bottom. Hemoglobin is included here so
 * HealthCare reaches feature parity with the ysalus `MetricsTypeList` order.
 */
export const METRIC_HEATMAP_ROW_ORDER = [
  MetricType.BloodSugar,
  MetricType.BloodPressure,
  MetricType.HeartRate,
  MetricType.Hematocrit,
  MetricType.Hemoglobin,
  MetricType.Ketone,
  MetricType.Cholesterol,
  MetricType.UricAcid,
] as const satisfies readonly MetricType[]

/** Human-readable i18n keys, kept identical to ysalus for parity. */
export const METRIC_TYPE_I18N_KEY: Record<MetricType, string> = {
  [MetricType.BloodPressure]: "bloodPressure",
  [MetricType.BloodSugar]: "bloodGlucose",
  [MetricType.Cholesterol]: "cholesterol",
  [MetricType.Ecg]: "ecg",
  [MetricType.HeartRate]: "heartRate",
  [MetricType.Hematocrit]: "hematocrit",
  [MetricType.Hemoglobin]: "hemoglobin",
  [MetricType.Ketone]: "ketone",
  [MetricType.Measurement]: "latestMeasurements",
  [MetricType.UricAcid]: "uricAcid",
}
