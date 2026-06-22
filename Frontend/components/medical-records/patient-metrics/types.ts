import type { MetricType } from "../ysalus-metrics/types"

import type {
  MetricsGranularity,
  MetricsPrimaryTab,
} from "./constants"

export type PatientMetricsUiState = {
  primaryTab: MetricsPrimaryTab
  granularity: MetricsGranularity
  highlightedMetricType: MetricType | null
  periodAnchor: Date
  selectedCalendarDay: Date | null
}

export type MetricSeverityLevel = "low" | "normal" | "upper" | "high"

export type LatestMeasurementRow = {
  id: string
  metricType: MetricType
  valueLabel: string
  unit: string
  time: string
  tag?: string | null
  severityTag?: string | null
  severityLevel?: MetricSeverityLevel | null
}

export type LatestMeasurementDateGroup = {
  dateLabel: string
  date: Date
  items: LatestMeasurementRow[]
}
