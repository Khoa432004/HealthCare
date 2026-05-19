/**
 * Pure chart-data helpers ported from
 * ysalus-source/ysalus-web/src/features/report/components/patient-metrics/charts/metricsTrackerChart.utils.ts
 *
 * Adjustments vs ysalus:
 * - Uses HealthCare's local `MetricType` / `MetricDetail` types
 *   (which are bit-for-bit compatible with ysalus' patient.type for the
 *   metrics fields the chart needs).
 * - `formatDateTime` is replaced by direct `date-fns/format` since HealthCare
 *   doesn't expose a localStorage-backed locale switch yet.
 */

import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  getDaysInMonth,
  isSameDay,
  isSameMonth,
  isSameYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns"

import {
  MetricTimeOfDay,
  MetricType,
  type MetricData,
  type MetricDetail,
} from "../../ysalus-metrics/types"

import {
  METRIC_HEATMAP_ROW_ORDER,
  type MetricsGranularity,
} from "../constants"
import type { MetricSeverityLevel } from "../types"
import {
  getMetricDetailSeverity,
  getMetricValueSeverity,
  getWorstSeverity,
} from "../utils/metricSeverity"

export type TimelinePoint = {
  date: Date
  key: string
  label: string
  isSelected: boolean
}

export type ChartPoint = {
  key: string
  value: number
  severity: MetricSeverityLevel
  /** Number of raw readings aggregated into this bucket (for tooltips). */
  sampleCount: number
}

/**
 * Visual shape for an individual dot. When set on a {@link RawChartPoint}
 * it overrides the series-level `marker` so a single series can encode
 * additional information per measurement (e.g. blood glucose meal context).
 *
 *  - "filled": solid disc, fill = severity color
 *  - "hollow": ring, fill = white, stroke = severity color
 *  - "half"  : left half filled (severity color), right half white,
 *              full severity-color border. Used for "before meal" BG.
 */
export type RawChartShape = "filled" | "hollow" | "half"

/**
 * One individual measurement, projected onto the chart timeline.
 *
 * Used to render every reading as its own dot while letting the line itself
 * trace the daily / monthly *average* (see {@link LineSeries.points}). The
 * `xFraction` lives in [-0.5, 0.5] and represents the time-of-day (week /
 * month granularity) or day-of-month (year granularity) within the bucket,
 * so the chart layer can offset the dot horizontally inside the slot:
 *
 *   finalX = getX(timelineIndex) + xFraction * slotWidth
 *
 * This recreates the "many dots per day, line through average" behaviour the
 * legacy ApexCharts implementation had for blood pressure / blood glucose.
 */
export type RawChartPoint = {
  /** Stable React key — usually `detailId` (or `${detailId}-sys|dia` for BP). */
  id: string
  /** Timeline bucket key (yyyy-MM-dd or yyyy-MM). */
  key: string
  /** Index into the parent timeline array. */
  timelineIndex: number
  /** Horizontal offset within the slot, in slot-width units. Range: [-0.5, 0.5]. */
  xFraction: number
  value: number
  severity: MetricSeverityLevel
  /** Original measurement timestamp (for tooltip "08:30" / "15 Mar"). */
  date: Date
  /**
   * Optional per-point shape, overrides the series marker. Currently only
   * populated for blood glucose to encode the meal context (before / after
   * meal / general).
   */
  shape?: RawChartShape
  /**
   * Optional human label for the categorical metadata behind `shape` —
   * surfaced in the tooltip (e.g. "Trước ăn"). Empty for general / fasting.
   */
  contextLabel?: string
}

type Bucket = {
  total: number
  count: number
  severity: MetricSeverityLevel | null
}

export type LineSeries = {
  id: string
  label: string
  /** Averaged value per bucket — drives the connecting line. */
  points: Array<ChartPoint | null>
  /**
   * One entry per individual measurement, optional. When present the chart
   * layer renders these as the dots and uses {@link points} only for the
   * line path. Empty / undefined falls back to "1 dot per averaged bucket".
   */
  rawPoints?: RawChartPoint[]
  marker: "filled" | "outlined"
}

export type ChartScale = {
  min: number
  max: number
  tickStep: number
  bands?: Array<{
    from: number
    to: number
    label?: string
  }>
}

export const EMPTY_DOT_COLOR = "#E4F5F8"
export const DEFAULT_LINE_COLOR = "#A6A8AA"
export const GRID_COLOR = "#EDF0F2"
export const AXIS_COLOR = "#A8AAAD"

const HEATMAP_ROW_SET: ReadonlySet<MetricType> = new Set(
  METRIC_HEATMAP_ROW_ORDER
)

function toDate(value: Date | string | number | null | undefined): Date {
  if (value instanceof Date) return value
  if (value == null) return new Date(0)
  return new Date(value)
}

export function getDetailDate(detail: MetricDetail): Date {
  return toDate(detail.takenAt ?? detail.updatedAt ?? detail.createdAt)
}

export function getTimelineKey(
  date: Date,
  granularity: MetricsGranularity
): string {
  if (granularity === "year") return format(date, "yyyy-MM")
  return format(date, "yyyy-MM-dd")
}

export function getPeriodRange(
  granularity: MetricsGranularity,
  anchorDate: Date
) {
  if (granularity === "week") {
    return {
      start: startOfWeek(anchorDate, { weekStartsOn: 1 }),
      end: endOfWeek(anchorDate, { weekStartsOn: 1 }),
    }
  }
  if (granularity === "year") {
    return {
      start: startOfYear(anchorDate),
      end: endOfYear(anchorDate),
    }
  }
  return {
    start: startOfMonth(anchorDate),
    end: endOfMonth(anchorDate),
  }
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime()
}

/**
 * Map a raw measurement timestamp to a horizontal offset within its slot.
 * Week / month buckets are 1 day wide → use time-of-day. Year buckets are
 * 1 month wide → use day-of-month (with hour as a tiny tiebreaker so two
 * readings on the same day don't perfectly overlap).
 */
function getXFraction(
  date: Date,
  granularity: MetricsGranularity
): number {
  if (granularity === "year") {
    const daysInMonth = getDaysInMonth(date)
    const dayFraction =
      (date.getDate() - 1 + date.getHours() / 24) / Math.max(daysInMonth, 1)
    return clampFraction(dayFraction - 0.5)
  }

  const minutesIntoDay = date.getHours() * 60 + date.getMinutes()
  return clampFraction(minutesIntoDay / 1440 - 0.5)
}

/**
 * Map a blood-glucose meal context to a dot shape. Fasting is intentionally
 * merged into the general "Bình thường" bucket (hollow ring) so the chart
 * only encodes three categories: before-meal, after-meal, general.
 */
export function resolveBloodSugarShape(
  timeOfDay: MetricTimeOfDay | string | null | undefined
): { shape: RawChartShape; contextLabel: string } {
  if (timeOfDay === MetricTimeOfDay.BeforeMeal) {
    return { shape: "half", contextLabel: "Trước ăn" }
  }
  if (timeOfDay === MetricTimeOfDay.AfterMeal) {
    return { shape: "filled", contextLabel: "Sau ăn" }
  }
  // Fasting + undefined + anything else → general / "Bình thường".
  return { shape: "hollow", contextLabel: "" }
}

function clampFraction(value: number): number {
  // Keep the dot comfortably inside the slot — leaves ~10% margin on each
  // side so circles don't bleed into neighbouring buckets.
  const limit = 0.4
  if (value > limit) return limit
  if (value < -limit) return -limit
  return value
}

export function buildTimeline(
  granularity: MetricsGranularity,
  anchorDate: Date,
  selectedDate: Date | null
): TimelinePoint[] {
  const range = getPeriodRange(granularity, anchorDate)
  const now = new Date()
  const selected = selectedDate ?? now
  const dates =
    granularity === "year"
      ? eachMonthOfInterval(range)
      : eachDayOfInterval(range)

  return dates.map((date) => {
    const isSelected =
      granularity === "year"
        ? isSameMonth(date, selected) && isSameYear(date, selected)
        : isSameDay(date, selected)

    return {
      date,
      key: getTimelineKey(date, granularity),
      label: granularity === "year" ? format(date, "MMM") : format(date, "d"),
      isSelected,
    }
  })
}

export function flattenMetricDetails(metrics: MetricData[]): MetricDetail[] {
  return metrics.flatMap((metric) => metric.metricDetails ?? [])
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null
  const num = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(num)) return null
  return num
}

function updateBucket(
  buckets: Map<string, Bucket>,
  key: string,
  value: number,
  severity: MetricSeverityLevel | null
) {
  const bucket = buckets.get(key) ?? { total: 0, count: 0, severity: null }
  bucket.total += value
  bucket.count += 1
  bucket.severity = getWorstSeverity(bucket.severity, severity)
  buckets.set(key, bucket)
}

function getMetricNumericValue(
  detail: MetricDetail,
  metricType: MetricType
): number | null {
  if (metricType === MetricType.HeartRate) {
    if (detail.type === MetricType.HeartRate) return toNumber(detail.value)
    if (detail.type === MetricType.BloodPressure) {
      return toNumber(detail.pulseValue)
    }
    return null
  }

  if (detail.type !== metricType) return null
  return toNumber(detail.value)
}

function buildSingleMetricSeries(
  details: MetricDetail[],
  metricType: MetricType,
  timeline: TimelinePoint[],
  granularity: MetricsGranularity,
  start: Date,
  end: Date
): LineSeries[] {
  const buckets = new Map<string, Bucket>()
  const rawPoints: RawChartPoint[] = []
  const timelineIndexByKey = new Map(timeline.map((p, idx) => [p.key, idx]))

  for (const detail of details) {
    const date = getDetailDate(detail)
    const value = getMetricNumericValue(detail, metricType)
    if (value == null || !isDateInRange(date, start, end)) continue

    const severity =
      metricType === MetricType.HeartRate
        ? getMetricValueSeverity(MetricType.HeartRate, value)
        : getMetricDetailSeverity(detail)

    const key = getTimelineKey(date, granularity)
    updateBucket(buckets, key, value, severity)

    const timelineIndex = timelineIndexByKey.get(key)
    if (timelineIndex != null) {
      // Blood glucose encodes meal context as the dot *shape* — every other
      // metric inherits the series-level marker.
      const bgShape =
        metricType === MetricType.BloodSugar
          ? resolveBloodSugarShape(detail.timeOfDay)
          : null

      rawPoints.push({
        id: `${detail.id}-${metricType}`,
        key,
        timelineIndex,
        xFraction: getXFraction(date, granularity),
        value,
        severity: severity ?? "normal",
        date,
        shape: bgShape?.shape,
        contextLabel: bgShape?.contextLabel || undefined,
      })
    }
  }

  return [
    {
      id: String(metricType),
      label: String(metricType),
      marker: "filled",
      rawPoints,
      points: timeline.map(({ key }) => {
        const bucket = buckets.get(key)
        if (!bucket || bucket.count === 0) return null
        return {
          key,
          value: Number((bucket.total / bucket.count).toFixed(2)),
          severity: bucket.severity ?? "normal",
          sampleCount: bucket.count,
        }
      }),
    },
  ]
}

function buildBloodPressureSeries(
  details: MetricDetail[],
  timeline: TimelinePoint[],
  granularity: MetricsGranularity,
  start: Date,
  end: Date
): LineSeries[] {
  const systolicBuckets = new Map<string, Bucket>()
  const diastolicBuckets = new Map<string, Bucket>()
  const systolicRaw: RawChartPoint[] = []
  const diastolicRaw: RawChartPoint[] = []
  const timelineIndexByKey = new Map(timeline.map((p, idx) => [p.key, idx]))

  for (const detail of details) {
    if (detail.type !== MetricType.BloodPressure) continue
    const date = getDetailDate(detail)
    if (!isDateInRange(date, start, end)) continue

    const key = getTimelineKey(date, granularity)
    const timelineIndex = timelineIndexByKey.get(key)
    const severity = getMetricDetailSeverity(detail)
    const xFraction = getXFraction(date, granularity)
    const systolic = toNumber(detail.systolicValue)
    const diastolic = toNumber(detail.diastolicValue)

    if (systolic != null) {
      updateBucket(systolicBuckets, key, systolic, severity)
      if (timelineIndex != null) {
        systolicRaw.push({
          id: `${detail.id}-sys`,
          key,
          timelineIndex,
          xFraction,
          value: systolic,
          severity: severity ?? "normal",
          date,
        })
      }
    }
    if (diastolic != null) {
      updateBucket(diastolicBuckets, key, diastolic, severity)
      if (timelineIndex != null) {
        diastolicRaw.push({
          id: `${detail.id}-dia`,
          key,
          timelineIndex,
          xFraction,
          value: diastolic,
          severity: severity ?? "normal",
          date,
        })
      }
    }
  }

  const buildPoints = (buckets: Map<string, Bucket>) =>
    timeline.map(({ key }) => {
      const bucket = buckets.get(key)
      if (!bucket || bucket.count === 0) return null
      return {
        key,
        value: Number((bucket.total / bucket.count).toFixed(2)),
        severity: bucket.severity ?? "normal",
        sampleCount: bucket.count,
      }
    })

  return [
    {
      id: "systolic",
      label: "Systolic",
      marker: "filled",
      points: buildPoints(systolicBuckets),
      rawPoints: systolicRaw,
    },
    {
      id: "diastolic",
      label: "Diastolic",
      marker: "outlined",
      points: buildPoints(diastolicBuckets),
      rawPoints: diastolicRaw,
    },
  ]
}

export function buildMetricSeries(
  details: MetricDetail[],
  metricType: MetricType,
  timeline: TimelinePoint[],
  granularity: MetricsGranularity,
  start: Date,
  end: Date
): LineSeries[] {
  if (metricType === MetricType.BloodPressure) {
    return buildBloodPressureSeries(details, timeline, granularity, start, end)
  }
  return buildSingleMetricSeries(
    details,
    metricType,
    timeline,
    granularity,
    start,
    end
  )
}

export function buildHeatmapStatus(
  details: MetricDetail[],
  timeline: TimelinePoint[],
  granularity: MetricsGranularity,
  start: Date,
  end: Date
) {
  const allowedKeys = new Set(timeline.map((point) => point.key))
  const statusMap = new Map<MetricType, Map<string, MetricSeverityLevel>>()

  for (const detail of details) {
    const date = getDetailDate(detail)
    const key = getTimelineKey(date, granularity)
    if (!allowedKeys.has(key) || !isDateInRange(date, start, end)) continue

    const addStatus = (
      metricType: MetricType,
      severity: MetricSeverityLevel | null
    ) => {
      if (!HEATMAP_ROW_SET.has(metricType) || !severity) return
      const metricMap = statusMap.get(metricType) ?? new Map()
      metricMap.set(
        key,
        getWorstSeverity(metricMap.get(key), severity) ?? "normal"
      )
      statusMap.set(metricType, metricMap)
    }

    addStatus(detail.type, getMetricDetailSeverity(detail))

    if (detail.type === MetricType.BloodPressure && detail.pulseValue != null) {
      addStatus(
        MetricType.HeartRate,
        getMetricValueSeverity(MetricType.HeartRate, detail.pulseValue)
      )
    }
  }

  return statusMap
}

export type HeatmapCellMeasure = {
  valueLabel: string
  sampleCount: number
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((acc, v) => acc + v, 0) / values.length
}

function summarizeHeatmapCell(
  metricType: MetricType,
  bucketDetails: MetricDetail[]
): HeatmapCellMeasure | null {
  if (metricType === MetricType.BloodPressure) {
    const bp = bucketDetails.filter(
      (d) => d.type === MetricType.BloodPressure
    )
    const systolics: number[] = []
    const diastolics: number[] = []

    for (const d of bp) {
      const s = toNumber(d.systolicValue)
      const dia = toNumber(d.diastolicValue)
      if (s != null) systolics.push(s)
      if (dia != null) diastolics.push(dia)
    }

    if (systolics.length === 0 && diastolics.length === 0) return null

    const sAvg = systolics.length ? mean(systolics) : null
    const dAvg = diastolics.length ? mean(diastolics) : null
    let valueLabel: string

    if (sAvg != null && dAvg != null) {
      valueLabel = `${formatChartValueDisplay(sAvg)}/${formatChartValueDisplay(dAvg)} mmHg`
    } else if (sAvg != null) {
      valueLabel = `${formatChartValueDisplay(sAvg)} mmHg`
    } else {
      valueLabel = `${formatChartValueDisplay(dAvg!)} mmHg`
    }

    return { valueLabel, sampleCount: bp.length }
  }

  if (metricType === MetricType.HeartRate) {
    const nums: number[] = []
    for (const d of bucketDetails) {
      const v = getMetricNumericValue(d, MetricType.HeartRate)
      if (v != null) nums.push(v)
    }
    if (nums.length === 0) return null
    return {
      valueLabel: `${formatChartValueDisplay(mean(nums))} ${getDefaultMetricUnit(MetricType.HeartRate)}`,
      sampleCount: nums.length,
    }
  }

  const typed = bucketDetails.filter(
    (d) => d.type === metricType && toNumber(d.value) != null
  )
  if (typed.length === 0) return null

  const vals = typed.map((d) => Number(d.value))
  const unit =
    typed.find((d) => d.unit?.trim())?.unit?.trim() ??
    getDefaultMetricUnit(metricType)

  return {
    valueLabel: `${formatChartValueDisplay(mean(vals))}${unit ? ` ${unit}` : ""}`,
    sampleCount: typed.length,
  }
}

export function buildHeatmapCellMeasures(
  details: MetricDetail[],
  timeline: TimelinePoint[],
  granularity: MetricsGranularity,
  start: Date,
  end: Date
): Map<MetricType, Map<string, HeatmapCellMeasure | null>> {
  const result = new Map<MetricType, Map<string, HeatmapCellMeasure | null>>()
  const allowedKeys = new Set(timeline.map((p) => p.key))

  for (const metricType of METRIC_HEATMAP_ROW_ORDER) {
    const row = new Map<string, HeatmapCellMeasure | null>()
    for (const point of timeline) {
      const bucketDetails = details.filter((d) => {
        const date = getDetailDate(d)
        return (
          getTimelineKey(date, granularity) === point.key &&
          allowedKeys.has(point.key) &&
          isDateInRange(date, start, end)
        )
      })
      row.set(point.key, summarizeHeatmapCell(metricType, bucketDetails))
    }
    result.set(metricType, row)
  }

  return result
}

export function getChartScale(metricType: MetricType): ChartScale {
  switch (metricType) {
    case MetricType.BloodPressure:
      return {
        min: 0,
        max: 200,
        tickStep: 40,
        bands: [
          { from: 95, to: 120, label: "TÂM THU" },
          { from: 55, to: 80, label: "TÂM TRƯƠNG" },
        ],
      }
    case MetricType.HeartRate:
      return {
        min: 0,
        max: 100,
        tickStep: 20,
        bands: [{ from: 60, to: 100 }],
      }
    case MetricType.BloodSugar:
      return {
        min: 0,
        max: 300,
        tickStep: 50,
        bands: [
          { from: 70, to: 100, label: "TRƯỚC ĂN" },
          { from: 100, to: 140, label: "SAU ĂN / BẤT KỲ" },
        ],
      }
    case MetricType.Ketone:
      return {
        min: 0,
        max: 1,
        tickStep: 0.2,
      }
    case MetricType.Hematocrit:
      return {
        min: 0,
        max: 60,
        tickStep: 10,
        bands: [{ from: 35, to: 50 }],
      }
    case MetricType.Hemoglobin:
      return {
        min: 0,
        max: 20,
        tickStep: 5,
        bands: [{ from: 12, to: 16.5 }],
      }
    case MetricType.Cholesterol:
      return {
        min: 0,
        max: 300,
        tickStep: 50,
        bands: [{ from: 0, to: 200 }],
      }
    case MetricType.UricAcid:
      return {
        min: 0,
        max: 12,
        tickStep: 2,
        bands: [{ from: 3.5, to: 7.2 }],
      }
    default:
      return { min: 0, max: 160, tickStep: 40 }
  }
}

const SCALE_PADDING_LARGE = 20
const SCALE_PADDING_COMPACT = 2

function collectSeriesExtents(
  series: LineSeries[]
): { min: number; max: number } | null {
  let minV = Infinity
  let maxV = -Infinity
  for (const s of series) {
    for (const p of s.points) {
      if (p) {
        minV = Math.min(minV, p.value)
        maxV = Math.max(maxV, p.value)
      }
    }
  }
  if (!Number.isFinite(minV) || !Number.isFinite(maxV)) return null
  return { min: minV, max: maxV }
}

function inferScalePadding(base: ChartScale, dataSpan: number): number {
  const nominalSpan = base.max - base.min
  if (nominalSpan <= 0) return SCALE_PADDING_LARGE
  if (base.max <= 2 && base.min >= 0) {
    return Math.max(0.06, Math.min(0.35, dataSpan * 0.35 + 0.04))
  }
  if (nominalSpan <= 35) return SCALE_PADDING_COMPACT
  return SCALE_PADDING_LARGE
}

function snapMaxToTickGrid(
  min: number,
  max: number,
  tickStep: number
): number {
  if (tickStep <= 0) return max
  const steps = Math.ceil((max - min) / tickStep - 1e-9)
  return min + Math.max(1, steps) * tickStep
}

function adjustTickStepForSpan(
  min: number,
  max: number,
  tickStep: number
): number {
  const span = max - min
  if (span <= 0 || tickStep <= 0) return tickStep
  const numTicks = span / tickStep
  if (numTicks <= 12) return tickStep

  const target = span / 8
  const pow10 = 10 ** Math.floor(Math.log10(Math.max(target, 1e-6)))
  const candidates = [1, 2, 5, 10].map((m) => m * pow10)
  return (
    candidates.find((step) => span / step <= 10) ??
    candidates[candidates.length - 1]
  )
}

export function expandChartScaleToFitSeries(
  base: ChartScale,
  series: LineSeries[]
): ChartScale {
  const ext = collectSeriesExtents(series)
  if (!ext) return base

  const pad = inferScalePadding(base, ext.max - ext.min)
  let nextMin = base.min
  let nextMax = base.max
  let changed = false

  if (ext.max > base.max) {
    nextMax = ext.max + pad
    changed = true
  }
  if (ext.min < base.min) {
    nextMin = ext.min - pad
    changed = true
  }
  if (base.min >= 0 && nextMin < 0) nextMin = 0
  if (!changed) return base

  const tickStep = adjustTickStepForSpan(nextMin, nextMax, base.tickStep)
  const alignedMax = snapMaxToTickGrid(nextMin, nextMax, tickStep)

  return {
    ...base,
    min: nextMin,
    max: Math.max(nextMax, alignedMax, ext.max + pad * 0.5),
    tickStep,
  }
}

export function buildTicks(scale: ChartScale): number[] {
  const ticks: number[] = []
  let current = scale.min
  while (current <= scale.max + 0.0001) {
    ticks.push(Number(current.toFixed(2)))
    current += scale.tickStep
  }
  return ticks
}

export function formatTick(value: number): string {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1).replace(/\.0$/, "")
}

export function buildPath(
  points: Array<ChartPoint | null>,
  getX: (index: number) => number,
  getY: (value: number) => number
): string {
  return points.reduce<string>((path, point, index) => {
    if (!point) return path
    const command = path ? "L" : "M"
    return `${path} ${command}${getX(index).toFixed(2)},${getY(point.value).toFixed(2)}`
  }, "")
}

export function formatTooltipPeriodLabel(
  date: Date,
  granularity: MetricsGranularity
): string {
  if (granularity === "year") return format(date, "MMMM yyyy")
  return format(date, "d MMM yyyy")
}

export function getDefaultMetricUnit(metricType: MetricType): string {
  switch (metricType) {
    case MetricType.BloodPressure:
      return "mmHg"
    case MetricType.HeartRate:
      return "bpm"
    case MetricType.BloodSugar:
      return "mg/dL"
    case MetricType.Ketone:
      return "mmol/L"
    case MetricType.Hematocrit:
      return "%"
    case MetricType.Hemoglobin:
      return "g/dL"
    case MetricType.Cholesterol:
      return "mg/dL"
    case MetricType.UricAcid:
      return "mg/dL"
    default:
      return ""
  }
}

export function formatChartValueDisplay(value: number): string {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(2).replace(/\.?0+$/, "")
}
