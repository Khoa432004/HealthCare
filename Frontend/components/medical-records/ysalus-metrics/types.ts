/**
 * Patient / metric types ported (unchanged shape) from
 * ysalus-source/ysalus-web/src/types/patient.type.ts so we can keep the UI
 * and business logic identical when porting HealthMetricsTab.
 */

export enum MetricType {
  BloodPressure = "BLOOD_PRESSURE",
  BloodSugar = "BLOOD_SUGAR",
  Cholesterol = "CHOLESTEROL",
  Ecg = "ECG",
  HeartRate = "HEART_RATE",
  Hematocrit = "HEMATOCRIT",
  Hemoglobin = "HEMOGLOBIN",
  Ketone = "KETONE",
  Measurement = "MEASUREMENT",
  UricAcid = "URIC_ACID",
}

export enum MetricCholesterolMeasurement {
  HighDensityLipoprotein = "HIGH_DENSITY_LIPOPROTEIN",
  LowDensityLipoprotein = "LOW_DENSITY_LIPOPROTEIN",
  TotalCholesterol = "TOTAL_CHOLESTEROL",
  Triglycerides = "TRIGLYCERIDES",
}

export enum MetricBloodSugarMeasurement {
  BloodGlucose = "BLOOD_GLUCOSE",
  Hba1C = "HBA1C",
}

export enum MetricTimeOfDay {
  AfterMeal = "AFTER_MEAL",
  BeforeMeal = "BEFORE_MEAL",
  Fasting = "FASTING",
}

export type MetricDetail = {
  id: string
  metricId?: string
  createdAt: string | Date
  updatedAt: string | Date
  takenAt?: string | Date | null
  deletedAt?: string | Date | null
  type: MetricType
  value?: number | string | null
  source?: "manual" | "device" | string | null
  note?: string | null
  unit?: string | null
  measurement?:
    | MetricBloodSugarMeasurement
    | MetricCholesterolMeasurement
    | string
    | null
  timeOfDay?: MetricTimeOfDay | string | null
  height?: number | null
  weight?: number | null
  kardiaHeartRate?: number | null
  kardiaDetermination?: string | null
  kardiaDuration?: number | null
  mapValue?: number | null
  pulseValue?: number | null
  systolicValue?: number | null
  diastolicValue?: number | null
  deviceType?: string | null
  registeredDeviceId?: string | null
  serialNumber?: string | null
  averageMode?: boolean | null
  /** Classification badge computed by the backend (LOW / NORMAL / HIGH). */
  badge?: "LOW" | "NORMAL" | "HIGH" | null
  /** Human-readable reference range label (e.g. "90 - 140 mg/dL"). */
  rangeLabel?: string | null
}

export type MetricData = {
  id: string
  patientId: string
  createdAt: string | Date
  updatedAt: string | Date
  deletedAt?: string | Date | null
  metricDetails: MetricDetail[]
}

export type MetricRealtimePayload = {
  patientId: string
  metricId: string
  metricDetail: MetricDetail
}

export type SelectOption = {
  value?: string
  label: string
}
