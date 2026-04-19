/**
 * Ported 1:1 from ysalus-source/ysalus-web/src/features/my-dashboard/components/add-measurement-popup/types.ts
 * Reuses the shared ysalus MetricType / MetricBloodSugarMeasurement / MetricCholesterolMeasurement / MetricTimeOfDay enums
 * that already live in ../ysalus-metrics/types.ts.
 */

import type {
  MetricBloodSugarMeasurement,
  MetricCholesterolMeasurement,
  MetricTimeOfDay,
  MetricType,
} from "../ysalus-metrics/types"

export type DeviceCapability =
  | "average_mode"
  | "meal_context"
  | "blood_pressure"
  | "heart_rate"
  | "blood_glucose"
  | "uric_acid"
  | "lipid_panel"

export type DeviceId = "p80" | "6connect"
export type PopupMode = "manual" | "device"
export type ManualMetricType =
  | MetricType.BloodPressure
  | MetricType.BloodSugar
  | MetricType.Cholesterol
  | MetricType.HeartRate
  | MetricType.Hematocrit
  | MetricType.Hemoglobin
  | MetricType.Ketone
  | MetricType.UricAcid
export type PopupView =
  | "closed"
  | "entry_selection"
  | "setup_guide"
  | "permission_check"
  | "scanning"
  | "device_discovered"
  | "connecting"
  | "permission_blocked"
  | "connect_failed"
  | "measuring"
  | "measurement_failed"
  | "result_review"
export type RecommendationTab = "info" | "nutrition"
export type SeverityLevel = "lv1" | "lv2" | "lv3" | "lv4" | "lv5" | "lv6"
export type ResultTone = "danger" | "info" | "success"
export type MeasurementFamily =
  | "blood_pressure"
  | "blood_glucose"
  | "heart_rate"
  | "uric_acid"
  | "lipid_panel"
  | "ketone"
  | "hematocrit"
  | "hemoglobin"
  | "combined_bghcthb"
  | "lactate"

export interface SubjectOption {
  id: string
  name: string
  readableId: string
  programLabel: string
  tagLabel?: string
  initials: string
  avatarClassName: string
}

export interface DeviceDefinition {
  id: DeviceId
  displayName: string
  bleNamePrefix: string
  thumbnailSrc: string
  setupPanelImageSrc: string
  serialNumber: string
  latestExaminationAt: string
  capabilities: DeviceCapability[]
  setupInstructions: string[]
}

export type MetricResultBadge = "low" | "normal" | "high"

export interface MetricResult {
  id: string
  label: string
  type: MetricType
  measurementSubType?: MetricBloodSugarMeasurement | MetricCholesterolMeasurement
  value: string
  badgeLabel?: string
  /** Classification key used to tint the badge pill (low/normal/high). */
  badgeKey?: MetricResultBadge
  rangeLabel?: string
}

export interface RecommendationContent {
  info: string
  nutrition: string
  followUp?: string
  note?: string
}

export interface ResultActions {
  canSave: boolean
  canSetReminder: boolean
  canBookAppointment: boolean
}

export interface NormalizedMeasurement {
  deviceId: DeviceId | null
  family: MeasurementFamily
  severity: SeverityLevel
  tone: ResultTone
  statusLabel: string
  takenAt: string
  metrics: MetricResult[]
  recommendation: RecommendationContent
  actions: ResultActions
}

export interface DeviceError {
  title: string
  headline: string
  bullets: string[]
}

export interface MeasurementContextFormValues {
  entryMode: PopupMode
  profileId: string
  averageMode: boolean
  manualMetricType: ManualMetricType | null
  takenAtDate: string
  takenAtTime: string
  systolicValue: string
  diastolicValue: string
  pulseValue: string
  bloodSugarValue: string
  cholesterolValue: string
  heartRateValue: string
  hematocritValue: string
  hemoglobinValue: string
  ketoneValue: string
  uricAcidValue: string
  unit: string
  measurement: MetricBloodSugarMeasurement | MetricCholesterolMeasurement | ""
  meal: MetricTimeOfDay | null
  notes: string
}

export interface UIState {
  view: PopupView
  mode: PopupMode
  deviceId: DeviceId | null
  registeredDeviceIds: DeviceId[]
  recommendationTab: RecommendationTab
  countdownSeconds: number
  discoveredDeviceName: string | null
  error: DeviceError | null
  result: NormalizedMeasurement | null
  manualMetricType: ManualMetricType | null
}

export type UIEvent =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "SELECT_MODE"; mode: PopupMode }
  | { type: "SELECT_MANUAL_METRIC"; metricType: ManualMetricType }
  | { type: "BACK_TO_MANUAL_SELECTION" }
  | { type: "REGISTER_DEVICES"; deviceIds: DeviceId[] }
  | { type: "OPEN_SETUP"; deviceId: DeviceId }
  | { type: "BACK_TO_ENTRY" }
  | { type: "START_CONNECT" }
  | { type: "PERMISSION_GRANTED" }
  | { type: "SCAN_FOUND"; deviceName: string }
  | { type: "CONFIRM_CONNECT" }
  | { type: "CONNECT_SUCCESS"; countdownSeconds: number }
  | {
      type: "CONNECTION_ERROR"
      view: Extract<
        PopupView,
        "permission_blocked" | "connect_failed" | "measurement_failed"
      >
      error: DeviceError
    }
  | { type: "COUNTDOWN_TICK"; countdownSeconds: number }
  | { type: "MANUAL_MEASUREMENT_REVIEWED"; result: NormalizedMeasurement }
  | { type: "MEASUREMENT_RECEIVED"; result: NormalizedMeasurement }
  | { type: "RETRY" }
  | { type: "SWITCH_RECOMMENDATION_TAB"; tab: RecommendationTab }
