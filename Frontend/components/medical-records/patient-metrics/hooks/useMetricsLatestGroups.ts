"use client"

import { useMemo } from "react"
import { format } from "date-fns"

import {
  MetricType,
  type MetricData,
  type MetricDetail,
} from "../../ysalus-metrics/types"

import type {
  LatestMeasurementDateGroup,
  LatestMeasurementRow,
} from "../types"
import { getKetoneSeverity } from "../utils/getKetoneSeverity"
import {
  getMetricDetailSeverity,
  getMetricValueSeverity,
} from "../utils/metricSeverity"

function getDetailTimestamp(detail: MetricDetail): number {
  return new Date(
    detail.takenAt ?? detail.updatedAt ?? detail.createdAt
  ).getTime()
}

function formatNumericValue(
  value: number | string | null | undefined
): string {
  if (value == null) return "—"
  const num = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(num)) return "—"
  const rounded = Math.round(num * 100) / 100
  if (Number.isInteger(rounded)) return String(rounded)
  if (Math.abs(rounded) < 10) return rounded.toFixed(1).replace(/\.0$/, "")
  return rounded
    .toFixed(2)
    .replace(/\.0+$/, "")
    .replace(/(\.\d)0$/, "$1")
}

function formatTag(
  timeOfDay: MetricDetail["timeOfDay"] | string | null | undefined
): string | null {
  if (!timeOfDay) return null
  if (timeOfDay === "AC" || timeOfDay === "BEFORE_MEAL") return "Trước ăn"
  if (timeOfDay === "PC" || timeOfDay === "AFTER_MEAL") return "Sau ăn"
  if (timeOfDay === "FASTING") return "Nhịn ăn"

  return String(timeOfDay)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatValue(detail: MetricDetail): string {
  switch (detail.type) {
    case MetricType.BloodPressure:
      return `${formatNumericValue(detail.systolicValue)}/${formatNumericValue(
        detail.diastolicValue
      )}`
    case MetricType.Ecg:
      return detail.kardiaDetermination ?? "ECG"
    case MetricType.Measurement:
      if (detail.height != null && detail.weight != null) {
        return `${formatNumericValue(detail.height)}/${formatNumericValue(
          detail.weight
        )}`
      }
      return formatNumericValue(detail.height ?? detail.weight ?? detail.value)
    default:
      return formatNumericValue(detail.value)
  }
}

function formatUnit(detail: MetricDetail): string {
  switch (detail.type) {
    case MetricType.BloodPressure:
      return "mmHg"
    case MetricType.HeartRate:
      return "bpm"
    case MetricType.BloodSugar:
      return detail.unit ?? "mg/dL"
    case MetricType.Ketone:
      return detail.unit ?? "mmol/L"
    case MetricType.Hematocrit:
      return detail.unit ?? "%"
    case MetricType.Hemoglobin:
      return detail.unit ?? "g/dL"
    case MetricType.Cholesterol:
      return detail.unit ?? "mg/dL"
    case MetricType.UricAcid:
      return detail.unit ?? "mg/dL"
    case MetricType.Ecg:
      return ""
    default:
      return detail.unit ?? ""
  }
}

function toRow(detail: MetricDetail): LatestMeasurementRow {
  const takenAt = new Date(
    detail.takenAt ?? detail.updatedAt ?? detail.createdAt
  )

  return {
    id: detail.id,
    metricType: detail.type,
    valueLabel: formatValue(detail),
    unit: formatUnit(detail),
    time: format(takenAt, "HH:mm"),
    tag: formatTag(detail.timeOfDay),
    severityTag:
      detail.type === MetricType.Ketone
        ? getKetoneSeverity(detail.value)
        : null,
    severityLevel: getMetricDetailSeverity(detail),
  }
}

function toHeartRateRowFromBloodPressure(
  detail: MetricDetail
): LatestMeasurementRow | null {
  if (detail.type !== MetricType.BloodPressure || detail.pulseValue == null) {
    return null
  }

  const takenAt = new Date(
    detail.takenAt ?? detail.updatedAt ?? detail.createdAt
  )

  return {
    id: `${detail.id}-pulse`,
    metricType: MetricType.HeartRate,
    valueLabel: formatNumericValue(detail.pulseValue),
    unit: "bpm",
    time: format(takenAt, "HH:mm"),
    tag: null,
    severityTag: null,
    severityLevel: getMetricValueSeverity(
      MetricType.HeartRate,
      detail.pulseValue
    ),
  }
}

function shouldIncludeDetail(
  detail: MetricDetail,
  filterType: MetricType | null
): boolean {
  if (!filterType) return true

  if (filterType === MetricType.HeartRate) {
    return (
      detail.type === MetricType.HeartRate ||
      (detail.type === MetricType.BloodPressure && detail.pulseValue != null)
    )
  }

  return detail.type === filterType
}

function buildRows(
  detail: MetricDetail,
  filterType: MetricType | null
): LatestMeasurementRow[] {
  if (filterType === MetricType.HeartRate) {
    if (detail.type === MetricType.HeartRate) return [toRow(detail)]
    const pulseRow = toHeartRateRowFromBloodPressure(detail)
    return pulseRow ? [pulseRow] : []
  }

  const rows = [toRow(detail)]

  if (!filterType) {
    const pulseRow = toHeartRateRowFromBloodPressure(detail)
    if (pulseRow) rows.push(pulseRow)
  }

  return rows
}

export function useMetricsLatestGroups(
  metrics: MetricData[],
  filterType: MetricType | null
): LatestMeasurementDateGroup[] {
  return useMemo(() => {
    const currentYear = new Date().getFullYear()

    const details = metrics
      .flatMap((metric) => metric.metricDetails ?? [])
      .filter((detail) => shouldIncludeDetail(detail, filterType))
      .sort(
        (left, right) => getDetailTimestamp(right) - getDetailTimestamp(left)
      )

    const grouped = new Map<
      string,
      { date: Date; items: LatestMeasurementRow[] }
    >()

    for (const detail of details) {
      const date = new Date(
        detail.takenAt ?? detail.updatedAt ?? detail.createdAt
      )
      const key = format(date, "yyyy-MM-dd")

      if (!grouped.has(key)) grouped.set(key, { date, items: [] })
      grouped.get(key)!.items.push(...buildRows(detail, filterType))
    }

    return Array.from(grouped.entries()).map(([, { date, items }]) => ({
      dateLabel: format(
        date,
        date.getFullYear() === currentYear ? "dd MMM" : "dd MMM yyyy"
      ),
      date,
      items,
    }))
  }, [filterType, metrics])
}
