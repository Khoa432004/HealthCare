/**
 * Ported from ysalus-source/.../add-measurement-popup/manual/config.ts
 * Labels inlined in Vietnamese (ysalus used i18n keys).
 */

import { MetricType } from "../ysalus-metrics/types"
import type { ManualMetricType } from "./types"

export interface ManualMetricDefinition {
  type: ManualMetricType
  label: string
  unitLabel: string
  description: string
}

export const manualMetricDefinitions: ManualMetricDefinition[] = [
  {
    type: MetricType.BloodPressure,
    label: "Huyết áp",
    unitLabel: "mmHg",
    description: "Nhập chỉ số huyết áp tâm thu và tâm trương.",
  },
  {
    type: MetricType.BloodSugar,
    label: "Đường huyết",
    unitLabel: "mg/dL",
    description: "Nhập chỉ số đường huyết đo được.",
  },
  {
    type: MetricType.Cholesterol,
    label: "Cholesterol",
    unitLabel: "mg/dL",
    description: "Nhập chỉ số cholesterol trong máu.",
  },
  {
    type: MetricType.HeartRate,
    label: "Nhịp tim",
    unitLabel: "bpm",
    description: "Nhập chỉ số nhịp tim hiện tại.",
  },
  {
    type: MetricType.Hematocrit,
    label: "Hematocrit",
    unitLabel: "%",
    description: "Nhập chỉ số hematocrit.",
  },
  {
    type: MetricType.Hemoglobin,
    label: "Hemoglobin",
    unitLabel: "g/dL",
    description: "Nhập chỉ số hemoglobin.",
  },
  {
    type: MetricType.Ketone,
    label: "Ketone",
    unitLabel: "mmol/L",
    description: "Nhập chỉ số ketone trong máu.",
  },
  {
    type: MetricType.UricAcid,
    label: "Acid uric",
    unitLabel: "mg/dL",
    description: "Nhập chỉ số acid uric trong máu.",
  },
]

export const manualMetricDefinitionMap = Object.fromEntries(
  manualMetricDefinitions.map((definition) => [definition.type, definition])
) as Record<ManualMetricType, ManualMetricDefinition>

export const getDefaultUnitForManualMetric = (
  metricType: ManualMetricType | null
) => {
  switch (metricType) {
    case MetricType.BloodSugar:
    case MetricType.Cholesterol:
    case MetricType.UricAcid:
      return "mg/dL"
    case MetricType.Ketone:
      return "mmol/L"
    case MetricType.HeartRate:
      return "bpm"
    case MetricType.Hematocrit:
      return "%"
    case MetricType.Hemoglobin:
      return "g/dL"
    default:
      return ""
  }
}
