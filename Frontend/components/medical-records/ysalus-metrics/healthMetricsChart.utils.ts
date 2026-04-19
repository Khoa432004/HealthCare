import { startOfDay, subDays, format } from "date-fns"

import {
  MetricType,
  type MetricData,
  type MetricDetail,
  type MetricRealtimePayload,
  type SelectOption,
} from "./types"
import {
  CLIENT_METRIC_FILTER_KEY_COLOR_MAP,
  CLIENT_METRIC_FILTER_KEY_ORDER,
  getClientMetricFilterLabel,
  matchesClientMetricFilterKey,
  type ClientMetricFilterKey,
} from "./healthMetricsFilter.constants"

export type HealthMetricOptionKey = ClientMetricFilterKey | "ecg"

export type HealthMetricChartKey =
  | Exclude<ClientMetricFilterKey, "bp">
  | "systolicValue"
  | "diastolicValue"
  | "pulseValue"
  | "ecg"

export type HealthMetricDateRange = "week" | "month" | "year"

export type HealthMetricsChartSeries = {
  name: string
  data: Array<number | null>
}

export type HealthMetricsChartYAxis = {
  min: number
  max: number
  tickAmount: number
}

export type HealthMetricsChartData = {
  series: HealthMetricsChartSeries[]
  categories: string[]
  yAxis?: HealthMetricsChartYAxis
}

export type LatestBloodPressureMeasurement = {
  map: number
  diastolic: number
  systolic: number
  pulse?: number | null
}

type HealthMetricValueField =
  | "value"
  | "kardiaHeartRate"
  | "mapValue"
  | "pulseValue"
  | "systolicValue"
  | "diastolicValue"

const supportedMetricOptionOrder: HealthMetricOptionKey[] = [
  ...CLIENT_METRIC_FILTER_KEY_ORDER,
  "ecg",
]

const metricColorKeys: Record<HealthMetricChartKey, string> = {
  systolicValue: CLIENT_METRIC_FILTER_KEY_COLOR_MAP.bp,
  diastolicValue: "#6BCBDB",
  pulseValue: CLIENT_METRIC_FILTER_KEY_COLOR_MAP.hr,
  hr: CLIENT_METRIC_FILTER_KEY_COLOR_MAP.hr,
  bg: CLIENT_METRIC_FILTER_KEY_COLOR_MAP.bg,
  ket: CLIENT_METRIC_FILTER_KEY_COLOR_MAP.ket,
  tc: CLIENT_METRIC_FILTER_KEY_COLOR_MAP.tc,
  hdl: CLIENT_METRIC_FILTER_KEY_COLOR_MAP.hdl,
  ldl: CLIENT_METRIC_FILTER_KEY_COLOR_MAP.ldl,
  triglyceride: CLIENT_METRIC_FILTER_KEY_COLOR_MAP.triglyceride,
  ua: CLIENT_METRIC_FILTER_KEY_COLOR_MAP.ua,
  hb: CLIENT_METRIC_FILTER_KEY_COLOR_MAP.hb,
  hct: CLIENT_METRIC_FILTER_KEY_COLOR_MAP.hct,
  ecg: "#6C757D",
}

const HEALTH_METRIC_OPTION_TO_CHART_KEYS_MAP: Record<
  HealthMetricOptionKey,
  readonly HealthMetricChartKey[]
> = {
  bp: ["systolicValue", "diastolicValue", "pulseValue"],
  hr: ["hr"],
  bg: ["bg"],
  ket: ["ket"],
  tc: ["tc"],
  hdl: ["hdl"],
  ldl: ["ldl"],
  triglyceride: ["triglyceride"],
  ua: ["ua"],
  hb: ["hb"],
  hct: ["hct"],
  ecg: ["ecg"],
}

export const HEALTH_METRIC_VALUE_RESOLUTION_MAP = {
  systolicValue: { key: "systolicValue", fields: ["systolicValue"] },
  diastolicValue: { key: "diastolicValue", fields: ["diastolicValue"] },
  pulseValue: { key: "pulseValue", fields: ["pulseValue"] },
  hr: { key: "hr", fields: ["pulseValue", "value"] },
  bg: { key: "bg", fields: ["value"] },
  ket: { key: "ket", fields: ["value"] },
  tc: { key: "tc", fields: ["value"] },
  hdl: { key: "hdl", fields: ["value"] },
  ldl: { key: "ldl", fields: ["value"] },
  triglyceride: { key: "triglyceride", fields: ["value"] },
  ua: { key: "ua", fields: ["value"] },
  hb: { key: "hb", fields: ["value"] },
  hct: { key: "hct", fields: ["value"] },
  ecg: { key: "ecg", fields: ["kardiaHeartRate", "value"] },
} as const satisfies Record<
  HealthMetricChartKey,
  { key: HealthMetricChartKey; fields?: readonly HealthMetricValueField[] }
>

const DEFAULT_HEALTH_METRIC_VALUE_FIELDS: readonly HealthMetricValueField[] = [
  "value",
]

const defaultYAxis: HealthMetricsChartYAxis = {
  min: 0,
  max: 160,
  tickAmount: 8,
}

function toDate(value: Date | string | number | null | undefined): Date {
  if (value instanceof Date) return value
  if (value === null || value === undefined) return new Date(0)
  return new Date(value)
}

function cloneMetricData(metric: MetricData): MetricData {
  return {
    id: metric.id,
    patientId: metric.patientId,
    createdAt: toDate(metric.createdAt),
    updatedAt: toDate(metric.updatedAt),
    deletedAt: metric.deletedAt ? toDate(metric.deletedAt) : undefined,
    metricDetails: metric.metricDetails.map((detail) => cloneMetricDetail(detail)),
  }
}

function cloneMetricDetail(detail: MetricDetail): MetricDetail {
  return {
    ...detail,
    createdAt: toDate(detail.createdAt),
    updatedAt: toDate(detail.updatedAt),
    takenAt: detail.takenAt ? toDate(detail.takenAt) : undefined,
    deletedAt: detail.deletedAt ? toDate(detail.deletedAt) : undefined,
  }
}

function getMetricDataKey(metric: MetricData): string {
  const createdAt = toDate(metric.createdAt).getTime()
  const updatedAt = toDate(metric.updatedAt).getTime()
  return metric.id || `${metric.patientId}:${createdAt}:${updatedAt}`
}

function getMetricDetailSortTimestamp(detail: MetricDetail): number {
  return toDate(
    detail.takenAt ?? detail.updatedAt ?? detail.createdAt
  ).getTime()
}

function isMetricRealtimePayload(
  overlay: MetricData | MetricRealtimePayload
): overlay is MetricRealtimePayload {
  return (
    typeof (overlay as MetricRealtimePayload).metricId === "string" &&
    Boolean((overlay as MetricRealtimePayload).metricDetail)
  )
}

function mergeRealtimeMetricDetail(
  metric: MetricData,
  overlay: MetricRealtimePayload
): MetricData {
  const nextMetric = cloneMetricData(metric)
  const nextDetail = cloneMetricDetail(overlay.metricDetail)
  const existingDetailIndex = nextMetric.metricDetails.findIndex(
    (detail) => detail.id === nextDetail.id
  )

  if (existingDetailIndex >= 0) {
    nextMetric.metricDetails[existingDetailIndex] = nextDetail
  } else {
    nextMetric.metricDetails.unshift(nextDetail)
  }

  nextMetric.metricDetails.sort(
    (left, right) =>
      getMetricDetailSortTimestamp(right) - getMetricDetailSortTimestamp(left)
  )

  const nextUpdatedAt = toDate(nextDetail.updatedAt ?? nextDetail.createdAt)
  if (nextUpdatedAt.getTime() > toDate(nextMetric.updatedAt).getTime()) {
    nextMetric.updatedAt = nextUpdatedAt
  }

  return nextMetric
}

function toNumericValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  const numeric = Number(value)
  return Number.isNaN(numeric) ? null : numeric
}

function isSupportedMetricKey(value: string): value is HealthMetricChartKey {
  return Object.prototype.hasOwnProperty.call(
    HEALTH_METRIC_VALUE_RESOLUTION_MAP,
    value
  )
}

function isBloodPressureSeriesMetricKey(
  metricKey: HealthMetricChartKey
): metricKey is "systolicValue" | "diastolicValue" | "pulseValue" {
  return (
    metricKey === "systolicValue" ||
    metricKey === "diastolicValue" ||
    metricKey === "pulseValue"
  )
}

function resolveMetricValueByKey(
  detail: MetricDetail,
  metricKey: HealthMetricChartKey
): number | null {
  const resolution = HEALTH_METRIC_VALUE_RESOLUTION_MAP[metricKey]

  if (isBloodPressureSeriesMetricKey(metricKey)) {
    if (detail.type !== MetricType.BloodPressure) return null
  } else if (
    metricKey !== HEALTH_METRIC_VALUE_RESOLUTION_MAP.ecg.key &&
    !matchesClientMetricFilterKey(detail, metricKey)
  ) {
    return null
  }

  if (
    metricKey === HEALTH_METRIC_VALUE_RESOLUTION_MAP.ecg.key &&
    detail.type !== MetricType.Ecg
  ) {
    return null
  }

  const fields = resolution.fields ?? DEFAULT_HEALTH_METRIC_VALUE_FIELDS
  for (const field of fields) {
    const value = toNumericValue(detail[field])
    if (value !== null) return value
  }
  return null
}

function resolveMetricLabel(metricKey: HealthMetricChartKey): string {
  if (metricKey === "systolicValue") return "Huyết áp tâm thu"
  if (metricKey === "diastolicValue") return "Huyết áp tâm trương"
  if (metricKey === "pulseValue") return "Nhịp tim"
  if (metricKey === "ecg") return "Điện tim"
  return getClientMetricFilterLabel(metricKey as ClientMetricFilterKey)
}

export function getHealthMetricLabel(metricKey: HealthMetricChartKey): string {
  return resolveMetricLabel(metricKey)
}

export function getHealthMetricColor(metricKey: HealthMetricChartKey): string {
  return metricColorKeys[metricKey]
}

function resolveDateRangeWindow(dateRange: HealthMetricDateRange) {
  const now = new Date()
  const from =
    dateRange === "month"
      ? startOfDay(subDays(now, 29))
      : dateRange === "year"
        ? startOfDay(subDays(now, 364))
        : startOfDay(subDays(now, 6))

  return {
    from,
    to: now,
    groupBy: dateRange === "year" ? "month" : "day",
  } as const
}

function formatChartCategory(date: Date, dateRange: HealthMetricDateRange): string {
  return format(date, dateRange === "year" ? "MMM yyyy" : "dd MMM")
}

function buildYAxis(values: number[]): HealthMetricsChartYAxis {
  if (!values.length) return defaultYAxis

  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const spread = maxValue - minValue
  const padding =
    spread === 0
      ? Math.max(Math.abs(maxValue) * 0.2, 1)
      : Math.max(spread * 0.15, 1)
  const min = Math.max(0, Math.floor(minValue - padding))
  const max = Math.ceil(maxValue + padding)

  return {
    min,
    max,
    tickAmount: Math.min(Math.max(Math.round((max - min) / 25), 4), 8),
  }
}

function resolvePointTimestamp(metric: MetricData, detail: MetricDetail): Date {
  return toDate(
    detail.takenAt ??
      detail.updatedAt ??
      detail.createdAt ??
      metric.updatedAt ??
      metric.createdAt
  )
}

export function getHealthMetricTimelineDate(metric: MetricData): Date {
  const detailTimestamps = (metric.metricDetails ?? []).map((detail) =>
    getMetricDetailSortTimestamp(detail)
  )
  const fallbackTimestamp = toDate(
    metric.updatedAt ?? metric.createdAt
  ).getTime()
  const latestTimestamp = detailTimestamps.length
    ? Math.max(...detailTimestamps, fallbackTimestamp)
    : fallbackTimestamp

  return new Date(latestTimestamp)
}

export function mergeHealthMetricData(
  metrics: MetricData[] = [],
  overlays: Array<MetricData | MetricRealtimePayload | null | undefined> = []
): MetricData[] {
  const normalized = new Map<string, MetricData>()

  for (const metric of metrics) {
    normalized.set(getMetricDataKey(metric), cloneMetricData(metric))
  }

  for (const overlay of overlays) {
    if (!overlay) continue

    if (isMetricRealtimePayload(overlay)) {
      const existingMetric = normalized.get(overlay.metricId)
      if (!existingMetric) continue

      normalized.set(
        overlay.metricId,
        mergeRealtimeMetricDetail(existingMetric, overlay)
      )
      continue
    }

    normalized.set(getMetricDataKey(overlay), cloneMetricData(overlay))
  }

  return Array.from(normalized.values()).sort((left, right) => {
    return (
      getHealthMetricTimelineDate(right).getTime() -
      getHealthMetricTimelineDate(left).getTime()
    )
  })
}

export function buildHealthMetricOptions(
  metrics: MetricData[] = []
): SelectOption[] {
  const availableOptionKeys = new Set<HealthMetricOptionKey>()

  for (const metric of metrics) {
    for (const detail of metric.metricDetails ?? []) {
      for (const optionKey of supportedMetricOptionOrder) {
        const chartKeys = HEALTH_METRIC_OPTION_TO_CHART_KEYS_MAP[optionKey]
        const hasAvailableValue = chartKeys.some(
          (metricKey) => resolveMetricValueByKey(detail, metricKey) !== null
        )
        if (hasAvailableValue) availableOptionKeys.add(optionKey)
      }
    }
  }

  return supportedMetricOptionOrder
    .filter((metricKey) => availableOptionKeys.has(metricKey))
    .map((metricKey) => ({
      value: metricKey,
      label:
        metricKey === "ecg"
          ? resolveMetricLabel(metricKey)
          : getClientMetricFilterLabel(metricKey),
    }))
}

export function resolveHealthMetricChartKeys(
  optionKey: HealthMetricOptionKey | null | undefined
): HealthMetricChartKey[] {
  if (!optionKey) return []
  return [...(HEALTH_METRIC_OPTION_TO_CHART_KEYS_MAP[optionKey] ?? [])]
}

export function buildHealthMetricChartData(
  metrics: MetricData[] = [],
  metricKeys: Array<HealthMetricChartKey | string> = [],
  dateRange: HealthMetricDateRange = "week"
): HealthMetricsChartData {
  const resolvedMetricKeys = Array.from(
    new Set(
      metricKeys.filter((metricKey): metricKey is HealthMetricChartKey => {
        return Boolean(metricKey) && isSupportedMetricKey(String(metricKey))
      })
    )
  )

  if (!resolvedMetricKeys.length) {
    return { series: [], categories: [] }
  }

  const { from, to, groupBy } = resolveDateRangeWindow(dateRange)
  const groupedPointsByMetric = new Map<
    HealthMetricChartKey,
    Map<string, { total: number; count: number; timestamp: Date }>
  >()
  const groupedTimeline = new Map<string, Date>()

  for (const metric of metrics.map(cloneMetricData)) {
    for (const detail of metric.metricDetails ?? []) {
      for (const metricKey of resolvedMetricKeys) {
        const value = resolveMetricValueByKey(detail, metricKey)
        if (value === null) continue

        const timestamp = resolvePointTimestamp(metric, detail)
        if (timestamp < from || timestamp > to) continue

        const groupKey =
          groupBy === "month"
            ? timestamp.toISOString().slice(0, 7)
            : timestamp.toISOString().slice(0, 10)

        const groupTimestamp =
          groupBy === "month"
            ? new Date(`${groupKey}-01T00:00:00.000Z`)
            : new Date(`${groupKey}T00:00:00.000Z`)

        groupedTimeline.set(groupKey, groupTimestamp)

        const metricGroupedPoints =
          groupedPointsByMetric.get(metricKey) ??
          new Map<string, { total: number; count: number; timestamp: Date }>()
        const current = metricGroupedPoints.get(groupKey) ?? {
          total: 0,
          count: 0,
          timestamp: groupTimestamp,
        }

        current.total += value
        current.count += 1
        current.timestamp = groupTimestamp
        metricGroupedPoints.set(groupKey, current)
        groupedPointsByMetric.set(metricKey, metricGroupedPoints)
      }
    }
  }

  const sortedTimeline = Array.from(groupedTimeline.entries())
    .map(([groupKey, timestamp]) => ({ groupKey, timestamp }))
    .sort(
      (left, right) => left.timestamp.getTime() - right.timestamp.getTime()
    )

  if (!sortedTimeline.length) {
    return { series: [], categories: [] }
  }

  const series = resolvedMetricKeys
    .map<HealthMetricsChartSeries>((metricKey) => {
      const metricGroupedPoints = groupedPointsByMetric.get(metricKey)
      return {
        name: metricKey,
        data: sortedTimeline.map(({ groupKey }) => {
          const point = metricGroupedPoints?.get(groupKey)
          if (!point) return null
          return Number((point.total / point.count).toFixed(2))
        }),
      }
    })
    .filter((seriesItem) => seriesItem.data.some((point) => point !== null))

  const values = series.flatMap((seriesItem) =>
    seriesItem.data.filter((point): point is number => point !== null)
  )

  if (!values.length) {
    return { series: [], categories: [] }
  }

  return {
    series,
    categories: sortedTimeline.map((point) =>
      formatChartCategory(point.timestamp, dateRange)
    ),
    yAxis: buildYAxis(values),
  }
}
