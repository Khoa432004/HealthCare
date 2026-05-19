import { MetricType, type MetricDetail } from "../../ysalus-metrics/types"

import type { MetricSeverityLevel } from "../types"

export const METRIC_SEVERITY_STYLE: Record<
  MetricSeverityLevel,
  {
    label: string
    color: string
    bgClassName: string
    textClassName: string
    borderClassName: string
  }
> = {
  low: {
    label: "Thấp",
    color: "#F4B41A",
    bgClassName: "bg-[#F4B41A]",
    textClassName: "text-[#9A6A00]",
    borderClassName: "border-l-[#F4B41A]",
  },
  normal: {
    label: "Bình thường",
    color: "#159E38",
    bgClassName: "bg-[#159E38]",
    textClassName: "text-[#159E38]",
    borderClassName: "border-l-[#159E38]",
  },
  upper: {
    label: "Hơi cao",
    color: "#FF970F",
    bgClassName: "bg-[#FF970F]",
    textClassName: "text-[#C96D00]",
    borderClassName: "border-l-[#FF970F]",
  },
  high: {
    label: "Cao",
    color: "#D7092F",
    bgClassName: "bg-[#D7092F]",
    textClassName: "text-[#D7092F]",
    borderClassName: "border-l-[#D7092F]",
  },
}

const severityRank: Record<MetricSeverityLevel, number> = {
  normal: 0,
  low: 1,
  upper: 2,
  high: 3,
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null
  const num = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(num)) return null
  return num
}

function getBloodPressureSeverity(
  systolic: number | null | undefined,
  diastolic: number | null | undefined
): MetricSeverityLevel | null {
  const sbp = toNumber(systolic)
  const dbp = toNumber(diastolic)

  if (sbp == null && dbp == null) return null
  if ((sbp != null && sbp < 90) || (dbp != null && dbp < 60)) return "low"
  if ((sbp != null && sbp >= 140) || (dbp != null && dbp >= 90)) return "high"
  if ((sbp != null && sbp >= 130) || (dbp != null && dbp >= 80)) return "upper"
  return "normal"
}

export function getMetricValueSeverity(
  metricType: MetricType,
  value: number | string | null | undefined
): MetricSeverityLevel | null {
  const numericValue = toNumber(value)
  if (numericValue == null) return null

  switch (metricType) {
    case MetricType.HeartRate:
      if (numericValue < 60) return "low"
      if (numericValue >= 120) return "high"
      if (numericValue > 100) return "upper"
      return "normal"
    case MetricType.BloodSugar:
      if (numericValue < 70) return "low"
      if (numericValue > 180) return "high"
      if (numericValue > 140) return "upper"
      return "normal"
    case MetricType.Ketone:
      if (numericValue >= 1.6) return "high"
      if (numericValue >= 0.6) return "upper"
      return "normal"
    case MetricType.Hematocrit:
      if (numericValue < 35) return "low"
      if (numericValue > 55) return "high"
      if (numericValue > 50) return "upper"
      return "normal"
    case MetricType.Hemoglobin:
      if (numericValue < 12) return "low"
      if (numericValue > 18) return "high"
      if (numericValue > 16.5) return "upper"
      return "normal"
    case MetricType.Cholesterol:
      if (numericValue >= 240) return "high"
      if (numericValue >= 200) return "upper"
      return "normal"
    case MetricType.UricAcid:
      if (numericValue < 3.5) return "low"
      if (numericValue > 8) return "high"
      if (numericValue > 7.2) return "upper"
      return "normal"
    default:
      return "normal"
  }
}

export function getMetricDetailSeverity(
  detail: MetricDetail
): MetricSeverityLevel | null {
  if (detail.type === MetricType.BloodPressure) {
    return getBloodPressureSeverity(detail.systolicValue, detail.diastolicValue)
  }

  if (detail.type === MetricType.Ecg || detail.type === MetricType.Measurement) {
    return "normal"
  }

  return getMetricValueSeverity(detail.type, detail.value)
}

export function getWorstSeverity(
  current: MetricSeverityLevel | null | undefined,
  next: MetricSeverityLevel | null | undefined
): MetricSeverityLevel | null {
  if (!current) return next ?? null
  if (!next) return current
  return severityRank[next] > severityRank[current] ? next : current
}
