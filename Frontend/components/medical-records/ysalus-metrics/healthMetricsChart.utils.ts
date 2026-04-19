import { startOfDay, subDays, format } from "date-fns"

import {
  MetricType,
  MetricTimeOfDay,
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

/**
 * Badge classification roll-up for a single chart data point.
 * - "BAD" if ANY contributing measurement in the bucket is LOW or HIGH.
 * - "NORMAL" if at least one contributing measurement is NORMAL and none are LOW/HIGH.
 * - null if no contributing measurement carries a backend classification.
 */
export type HealthMetricPointBadge = "BAD" | "NORMAL" | null

export type HealthMetricsChartSeries = {
  name: string
  data: Array<number | null>
  badges?: Array<HealthMetricPointBadge>
}

/**
 * Scatter overlay used for blood pressure: keeps the aggregated daily-average
 * line untouched while exposing every individual measurement as its own dot.
 *
 * `xCategory` must match one of the chart x-axis labels so ApexCharts plots
 * the dot on the correct day; multiple points with the same `xCategory` are
 * allowed (and expected — that's the whole point of the overlay).
 */
export type HealthMetricScatterMarker = "filled" | "hollow"

/**
 * Shapes supported for per-point scatter overlays:
 *  - "filled": solid circle (badge color fill, white stroke)
 *  - "hollow": ring (white fill, badge color stroke) — fasting
 *  - "half":   half-filled circle (left half badge color, right half white,
 *             with a badge color border) — before-meal BG. Rendered via an
 *             SVG image annotation since ApexCharts markers can't do "half".
 */
export type HealthMetricPointShape = "filled" | "hollow" | "half"

/**
 * Fully-resolved per-point visual style. Emitted for metrics like blood
 * glucose where each measurement has its own color (badge palette) and shape
 * (meal context), so the chart layer doesn't need metric-specific knowledge.
 *
 * `color` is the single accent color (the badge color); how it's applied
 * depends on `shape` — the chart layer handles the mapping.
 */
export type HealthMetricPointStyle = {
  shape: HealthMetricPointShape
  color: string
}

export type HealthMetricScatterPoint = {
  /**
   * Numeric index into the chart's `categories` array — ApexCharts mixes
   * line (number[] aligned to categories) and scatter ({x,y} pairs) most
   * reliably when scatter x values are the integer position on the category
   * axis, not the category label itself.
   */
  x: number
  y: number
  badge: "LOW" | "NORMAL" | "HIGH" | null
  /** Optional per-point style — overrides series defaults. Used by BG. */
  style?: HealthMetricPointStyle
}

export type HealthMetricScatterSeries = {
  /** Stable id used by the chart layer to differentiate from main lines. */
  name: string
  /** The aggregated line series this scatter sits on top of. */
  parentKey: HealthMetricChartKey
  /** Default visual style when a point doesn't provide its own `style`. */
  marker: HealthMetricScatterMarker
  /** Default color reused from the parent metric (e.g. systolic red). */
  color: string
  data: HealthMetricScatterPoint[]
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
  /**
   * Optional per-measurement scatter overlays. Currently emitted only for the
   * BP `systolicValue`/`diastolicValue` keys.
   */
  scatterSeries?: HealthMetricScatterSeries[]
}

/**
 * Which chart keys get a per-measurement scatter overlay. Each entry also
 * declares the default marker — BG uses per-point style (derived from meal
 * context) so its default is mostly irrelevant, but we still set "filled".
 */
const SCATTER_OVERLAY_CONFIG: Partial<
  Record<HealthMetricChartKey, HealthMetricScatterMarker>
> = {
  systolicValue: "filled",
  diastolicValue: "hollow",
  bg: "filled",
}

/**
 * Metric-specific badge color palettes. Blood glucose uses a 3-color palette
 * (yellow/green/red) matching the reference design; everything else uses the
 * binary BAD/NORMAL mapping via HEALTH_METRIC_BADGE_COLOR at the chart layer.
 */
const BG_BADGE_FILL_COLOR = {
  LOW: "#F59E0B", // amber-500
  NORMAL: "#10B981", // emerald-500
  HIGH: "#EF4444", // rose-500
} as const

/** Fallback fill when a BG measurement has no backend classification. */
const BG_UNCLASSIFIED_FILL_COLOR = "#9CA3AF" // gray-400

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

/** Marker colors used when a chart data point carries a backend classification. */
export const HEALTH_METRIC_BADGE_COLOR = {
  BAD: "#ef4444", // rose-500 — any LOW/HIGH bucket
  NORMAL: "#10b981", // emerald-500 — all NORMAL bucket
} as const

function mergeBadge(
  current: HealthMetricPointBadge,
  incoming: "LOW" | "NORMAL" | "HIGH" | null | undefined
): HealthMetricPointBadge {
  if (current === "BAD") return "BAD"
  if (incoming === "LOW" || incoming === "HIGH") return "BAD"
  if (incoming === "NORMAL") return current === null ? "NORMAL" : current
  return current
}

/**
 * Resolve the per-point visual style for a blood glucose measurement.
 * Color is driven by the backend badge (LOW/NORMAL/HIGH); shape encodes
 * the meal context:
 *  - Fasting     -> hollow ring
 *  - Before meal -> half-filled circle
 *  - After meal  -> solid filled circle
 *  - Unspecified -> solid filled circle (treated as "any/general")
 */
function resolveBloodGlucosePointStyle(
  badge: "LOW" | "NORMAL" | "HIGH" | null,
  timeOfDay: MetricTimeOfDay | string | null | undefined
): HealthMetricPointStyle {
  const color = badge ? BG_BADGE_FILL_COLOR[badge] : BG_UNCLASSIFIED_FILL_COLOR

  if (timeOfDay === MetricTimeOfDay.Fasting) {
    return { shape: "hollow", color }
  }
  if (timeOfDay === MetricTimeOfDay.BeforeMeal) {
    return { shape: "half", color }
  }
  return { shape: "filled", color }
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
    Map<
      string,
      {
        total: number
        count: number
        timestamp: Date
        badge: HealthMetricPointBadge
      }
    >
  >()
  /**
   * Raw individual measurements per metric, used to build per-measurement
   * scatter overlays. Indexed first by metric key, then a flat list of
   * { groupKey, value, badge, timeOfDay } entries — one per detail.
   * `timeOfDay` is only meaningful for metrics that care about meal context
   * (BG today) but we carry it uniformly to keep the structure simple.
   */
  const rawPointsByMetric = new Map<
    HealthMetricChartKey,
    Array<{
      groupKey: string
      value: number
      badge: "LOW" | "NORMAL" | "HIGH" | null
      timeOfDay: MetricTimeOfDay | string | null | undefined
    }>
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
          new Map<
            string,
            {
              total: number
              count: number
              timestamp: Date
              badge: HealthMetricPointBadge
            }
          >()
        const current = metricGroupedPoints.get(groupKey) ?? {
          total: 0,
          count: 0,
          timestamp: groupTimestamp,
          badge: null as HealthMetricPointBadge,
        }

        current.total += value
        current.count += 1
        current.timestamp = groupTimestamp
        current.badge = mergeBadge(current.badge, detail.badge ?? null)
        metricGroupedPoints.set(groupKey, current)
        groupedPointsByMetric.set(metricKey, metricGroupedPoints)

        // Track raw measurement for scatter overlay (filtered by
        // SCATTER_OVERLAY_CONFIG so we don't waste memory on metrics that
        // don't render individual-measurement dots).
        if (SCATTER_OVERLAY_CONFIG[metricKey]) {
          const rawList = rawPointsByMetric.get(metricKey) ?? []
          rawList.push({
            groupKey,
            value,
            badge: detail.badge ?? null,
            timeOfDay: detail.timeOfDay ?? null,
          })
          rawPointsByMetric.set(metricKey, rawList)
        }
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
        badges: sortedTimeline.map(({ groupKey }) => {
          const point = metricGroupedPoints?.get(groupKey)
          return point ? point.badge : null
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

  const categories = sortedTimeline.map((point) =>
    formatChartCategory(point.timestamp, dateRange)
  )
  const groupKeyToIndex = new Map(
    sortedTimeline.map((point, index) => [point.groupKey, index])
  )

  // Per-measurement scatter overlay. One series per metricKey declared in
  // SCATTER_OVERLAY_CONFIG, ONLY when that metricKey is part of the active
  // filter — otherwise the overlay would never render.
  const scatterSeries: HealthMetricScatterSeries[] = []
  for (const metricKey of resolvedMetricKeys) {
    const marker = SCATTER_OVERLAY_CONFIG[metricKey]
    if (!marker) continue
    const rawList = rawPointsByMetric.get(metricKey)
    if (!rawList?.length) continue

    const points: HealthMetricScatterPoint[] = rawList.flatMap((raw) => {
      const xIndex = groupKeyToIndex.get(raw.groupKey)
      if (xIndex === undefined) return []

      // Blood glucose uses per-point styling (color by badge, shape by meal
      // context) so each measurement can visually encode both dimensions.
      // Other metrics fall back to the series-level marker + color and let
      // the chart layer handle badge coloring.
      const style =
        metricKey === "bg"
          ? resolveBloodGlucosePointStyle(raw.badge, raw.timeOfDay)
          : undefined

      return [{ x: xIndex, y: raw.value, badge: raw.badge, style }]
    })
    if (!points.length) continue

    scatterSeries.push({
      name: `${metricKey}-points`,
      parentKey: metricKey,
      marker,
      color: getHealthMetricColor(metricKey),
      data: points,
    })
  }

  // Include scatter Y values when sizing the Y axis so individual highs/lows
  // aren't clipped (the average alone may understate the spread).
  const scatterValues = scatterSeries.flatMap((s) => s.data.map((p) => p.y))

  return {
    series,
    categories,
    yAxis: buildYAxis([...values, ...scatterValues]),
    scatterSeries: scatterSeries.length ? scatterSeries : undefined,
  }
}
