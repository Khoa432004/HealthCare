/**
 * Adapter: convert our flat MedicalVitalMetricPoint[] into the ysalus-style
 * MetricData[] shape so we can reuse the ported chart + filter logic unchanged.
 *
 * One MetricData is produced per (appointmentId + measuredAt bucket) so the
 * vital signs recorded in the same visit are grouped together — this matches
 * ysalus where a MetricData represents one measurement session.
 */

import type { MedicalVitalMetricPoint } from "@/services/patient-vital-metrics.service"

import {
  MetricBloodSugarMeasurement,
  MetricTimeOfDay,
  MetricType,
  type MetricData,
  type MetricDetail,
} from "./types"

const SIGN_TYPE_TO_METRIC_TYPE: Record<string, MetricType> = {
  "Blood pressure": MetricType.BloodPressure,
  "Heart rate": MetricType.HeartRate,
  Temperature: MetricType.Measurement,
  "SpO₂": MetricType.Measurement,
  "Respiratory rate": MetricType.Measurement,
  "Blood glucose": MetricType.BloodSugar,
  Cholesterol: MetricType.Cholesterol,
  Weight: MetricType.Measurement,
  Hemoglobin: MetricType.Hemoglobin,
  Hematocrit: MetricType.Hematocrit,
  Ketone: MetricType.Ketone,
  "Uric acid": MetricType.UricAcid,
}

function parseNumeric(raw: string): number | null {
  if (raw === null || raw === undefined) return null
  const match = String(raw).replace(",", ".").match(/-?\d+(\.\d+)?/)
  if (!match) return null
  const n = Number(match[0])
  return Number.isNaN(n) ? null : n
}

function parseBloodPressure(
  raw: string
): { systolic: number; diastolic: number } | null {
  if (!raw) return null
  const [sysRaw, diaRaw] = String(raw).split("/")
  if (!sysRaw || !diaRaw) return null
  const sys = parseNumeric(sysRaw)
  const dia = parseNumeric(diaRaw)
  if (sys === null || dia === null) return null
  return { systolic: sys, diastolic: dia }
}

function resolveSource(
  point: MedicalVitalMetricPoint
): "manual" | "device" {
  if (point.source === "MANUAL") return "manual"
  if (point.source === "DEVICE") return "device"
  return "device"
}

function resolveTimeOfDay(
  meal: MedicalVitalMetricPoint["meal"]
): MetricTimeOfDay | undefined {
  if (meal === "BEFORE_MEAL") return MetricTimeOfDay.BeforeMeal
  if (meal === "AFTER_MEAL") return MetricTimeOfDay.AfterMeal
  return undefined
}

function buildMetricDetail(
  point: MedicalVitalMetricPoint,
  patientId: string,
  index: number
): MetricDetail | null {
  const metricType = SIGN_TYPE_TO_METRIC_TYPE[point.signType]
  if (!metricType) return null

  const takenAt = new Date(point.measuredAt)
  const baseId = `${point.appointmentId}-${point.signType}-${index}`
  const source = resolveSource(point)

  const badge = point.badge ?? null
  const rangeLabel = point.rangeLabel ?? null
  const timeOfDay = resolveTimeOfDay(point.meal)

  if (metricType === MetricType.BloodPressure) {
    const parsed = parseBloodPressure(point.value)
    if (!parsed) return null
    return {
      id: baseId,
      metricId: point.appointmentId,
      createdAt: takenAt,
      updatedAt: takenAt,
      takenAt,
      type: MetricType.BloodPressure,
      source,
      unit: point.unit,
      systolicValue: parsed.systolic,
      diastolicValue: parsed.diastolic,
      value: parsed.systolic,
      badge,
      rangeLabel,
    }
  }

  const numeric = parseNumeric(point.value)
  if (numeric === null) return null

  // NOTE: We intentionally skip generic Measurement entries (Temperature,
  // SpO₂, Respiratory rate, Weight) from the chart pipeline because the
  // ysalus chart filter keys (bp / hr / bg / ket / tc / hdl / ldl /
  // triglyceride / ua / hb / hct / ecg) don't include them. We still keep
  // them in MetricData so the "Chỉ số gần nhất" list can show them.
  return {
    id: baseId,
    metricId: point.appointmentId,
    createdAt: takenAt,
    updatedAt: takenAt,
    takenAt,
    type: metricType,
    source,
    unit: point.unit,
    value: numeric,
    badge,
    rangeLabel,
    ...(metricType === MetricType.BloodSugar
      ? {
          timeOfDay,
          measurement: MetricBloodSugarMeasurement.BloodGlucose,
        }
      : {}),
    ...(point.signType === "Weight" ? { weight: numeric } : {}),
  }
}

/**
 * Group points by visit (appointmentId). Within each visit all details share
 * the same measuredAt so they appear as one row in ysalus "Latest
 * measurements" list.
 *
 * Additionally, when a BP and a HR detail co-exist in the same bucket (the
 * backend expands a BP+pulse self-measurement into two points with the same
 * grouping id), we fold the HR into the BP detail's `pulseValue` so the
 * MeasurementItem renders them in a single card (BP on the left, HR on the
 * right as secondary) — matching the ysalus-source UX.
 */
export function adaptVitalMetricsToMetricData(
  points: MedicalVitalMetricPoint[],
  patientId: string
): MetricData[] {
  const byAppointment = new Map<
    string,
    { takenAt: Date; details: MetricDetail[] }
  >()

  points.forEach((point, index) => {
    const detail = buildMetricDetail(point, patientId, index)
    if (!detail) return

    const key = point.appointmentId
    const takenAt = new Date(point.measuredAt)
    const bucket = byAppointment.get(key) ?? { takenAt, details: [] }
    bucket.details.push(detail)
    if (takenAt.getTime() > bucket.takenAt.getTime()) {
      bucket.takenAt = takenAt
    }
    byAppointment.set(key, bucket)
  })

  return Array.from(byAppointment.entries()).map(([appointmentId, bucket]) => ({
    id: appointmentId,
    patientId,
    createdAt: bucket.takenAt,
    updatedAt: bucket.takenAt,
    metricDetails: mergeBpAndHrDetails(bucket.details).sort((a, b) => {
      const order: Record<MetricType, number> = {
        [MetricType.BloodPressure]: 0,
        [MetricType.HeartRate]: 1,
        [MetricType.BloodSugar]: 2,
        [MetricType.Cholesterol]: 3,
        [MetricType.UricAcid]: 4,
        [MetricType.Hemoglobin]: 5,
        [MetricType.Hematocrit]: 6,
        [MetricType.Ketone]: 7,
        [MetricType.Ecg]: 8,
        [MetricType.Measurement]: 9,
      }
      return (order[a.type] ?? 99) - (order[b.type] ?? 99)
    }),
  }))
}

/**
 * If a BP detail and a HR detail co-exist within the same bucket, inline the
 * HR value as `pulseValue` on the BP detail and drop the standalone HR entry.
 * This mirrors ysalus-source where a single measurement session with both
 * systolic/diastolic + pulse is rendered as one combined card.
 */
function mergeBpAndHrDetails(details: MetricDetail[]): MetricDetail[] {
  const bpIndex = details.findIndex(
    (d) => d.type === MetricType.BloodPressure
  )
  if (bpIndex < 0) return details

  const hrIndex = details.findIndex(
    (d) => d.type === MetricType.HeartRate
  )
  if (hrIndex < 0) return details

  const bp = details[bpIndex]
  const hr = details[hrIndex]

  if (bp.pulseValue !== undefined && bp.pulseValue !== null) return details

  const pulseValue =
    typeof hr.value === "number" && !Number.isNaN(hr.value) ? hr.value : null
  if (pulseValue === null) return details

  const merged: MetricDetail = { ...bp, pulseValue }
  return details
    .map((d, index) => (index === bpIndex ? merged : d))
    .filter((_, index) => index !== hrIndex)
}
