"use client"

import type { ReactNode } from "react"

import { LineChart } from "./LineChart"
import {
  HEALTH_METRIC_BADGE_COLOR,
  type HealthMetricPointBadge,
  type HealthMetricScatterSeries,
} from "./healthMetricsChart.utils"

type ChartSeries = {
  name: string
  data: Array<number | null>
}

interface Props {
  /**
   * `series[i].name` is expected to be the internal metric key (e.g.
   * "systolicValue") so we can match it against scatter overlays' `parentKey`.
   * Human-readable legend text is supplied via `legendLabels`.
   */
  series?: ChartSeries[]
  colors?: string[]
  categories?: string[]
  /** Human-readable labels shown in the legend, aligned with `series`. */
  legendLabels?: string[]
  /** Aligned with `series` — each inner array is the per-point classification. */
  badgesPerSeries?: Array<Array<HealthMetricPointBadge>>
  /**
   * Per-measurement scatter overlays (BP today). Rendered as ApexCharts
   * annotations.points so multiple measurements on the same day can coexist
   * with the aggregated daily-average line series.
   */
  scatterSeries?: HealthMetricScatterSeries[]
  yaxis?: {
    min: number
    max: number
    tickAmount: number
  }
  height?: number | string
  className?: string
}

const SCATTER_MARKER_SIZE = 6
const LINE_MARKER_SIZE = 6

/**
 * Build an SVG data URI of a half-filled circle: left half solid `color`,
 * right half white, with a `color` border all around. Used for the
 * "before-meal" blood glucose marker where the existing ApexCharts marker
 * shapes (circle / square) aren't enough.
 */
const buildHalfCircleDataUri = (color: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="l"><rect x="0" y="0" width="7" height="14"/></clipPath></defs><circle cx="7" cy="7" r="5" fill="#ffffff" stroke="${color}" stroke-width="2"/><circle cx="7" cy="7" r="5" fill="${color}" clip-path="url(#l)"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const defaultYAxis = {
  min: 0,
  max: 160,
  tickAmount: 8,
}

export const HealthMetricsChart = ({
  series,
  colors,
  className,
  categories,
  legendLabels,
  badgesPerSeries,
  scatterSeries,
  yaxis,
  height = 350,
}: Props) => {
  const resolvedSeries = series ?? []
  const resolvedColors = colors ?? []
  const resolvedCategories = categories ?? []
  const resolvedYAxis = yaxis ?? defaultYAxis
  const resolvedScatter = scatterSeries ?? []
  const resolvedLegendLabels = legendLabels ?? resolvedSeries.map((s) => s.name)

  /**
   * Blood glucose uses per-point styling (color = badge, shape = meal
   * context), so the standard single-item legend ("Đường huyết") can't
   * convey what the dots mean. When BG is present we hide ApexCharts'
   * built-in legend and render a richer explanatory legend below the chart.
   */
  const hasBgScatter = resolvedScatter.some((s) => s.parentKey === "bg")

  /**
   * Ketone renders as a column (bar) chart — each daily reading is a bar
   * instead of a line point. Detection is based on the active series being
   * solely the `ket` metric; mixing ket with other metrics isn't a real UI
   * state today, but if it ever happens we fall back to line mode.
   */
  const isBarChart =
    resolvedSeries.length > 0 &&
    resolvedSeries.every((s) => s.name === "ket")

  /**
   * Set of internal metric keys whose aggregated line has a per-measurement
   * overlay drawn via annotations. Their line markers are hidden so the
   * overlay owns the dots and the line stays a clean, smooth average curve.
   *
   * Matching is done against `series.name` which must be the raw internal key
   * (e.g. "systolicValue"), NOT the translated legend label.
   */
  const scatterParentNames = new Set<string>(
    resolvedScatter.map((s) => s.parentKey)
  )

  /** Per-series marker fills/sizes/strokes via parallel arrays. */
  const markerSizes: number[] = []
  const markerColors: string[] = []
  const markerStrokeColors: string[] = []
  const markerStrokeWidths: number[] = []

  resolvedSeries.forEach((s, i) => {
    const lineColor = resolvedColors[i] ?? "#667085"
    if (scatterParentNames.has(s.name)) {
      // The annotation overlay below owns this metric's dots.
      markerSizes[i] = 0
    } else {
      markerSizes[i] = LINE_MARKER_SIZE
    }
    markerColors[i] = lineColor
    markerStrokeColors[i] = "#ffffff"
    markerStrokeWidths[i] = 1
  })

  /** Discrete badge overrides for NON-BP line series only. */
  type DiscreteMarker = {
    seriesIndex: number
    dataPointIndex: number
    fillColor: string
    strokeColor: string
    size: number
  }

  const discreteMarkers: DiscreteMarker[] = []

  ;(badgesPerSeries ?? []).forEach((seriesBadges, seriesIndex) => {
    if (markerSizes[seriesIndex] === 0) return // overlay handles it
    seriesBadges.forEach((badge, dataPointIndex) => {
      if (!badge) return
      discreteMarkers.push({
        seriesIndex,
        dataPointIndex,
        fillColor: HEALTH_METRIC_BADGE_COLOR[badge],
        strokeColor: "#ffffff",
        size: LINE_MARKER_SIZE,
      })
    })
  })

  /**
   * Per-measurement overlay as annotations.points. This is a reliable way to
   * place arbitrary {x, y} markers on top of a line chart without the quirks
   * of ApexCharts mixed line+scatter series (where scatter + category axis
   * + multiple points per day often don't render correctly).
   *
   * `x` is the category LABEL (e.g. "19 Apr") — ApexCharts matches that to
   * the xaxis.categories position; `y` is the measurement value.
   */
  type AnnotationPoint = {
    x: string
    y: number
    marker?: {
      size: number
      fillColor: string
      strokeColor: string
      strokeWidth: number
      shape: "circle"
    }
    image?: {
      path: string
      width: number
      height: number
      offsetX?: number
      offsetY?: number
    }
  }

  const annotationPoints: AnnotationPoint[] = []
  for (const s of resolvedScatter) {
    for (const point of s.data) {
      const xLabel = resolvedCategories[point.x]
      if (!xLabel) continue

      // Per-point style wins (BG uses it to encode badge color + meal shape).
      if (point.style) {
        if (point.style.shape === "half") {
          // ApexCharts markers only support circle/square — render half-filled
          // circles via an SVG data URI image annotation instead.
          annotationPoints.push({
            x: xLabel,
            y: point.y,
            image: {
              path: buildHalfCircleDataUri(point.style.color),
              width: SCATTER_MARKER_SIZE * 2 + 2,
              height: SCATTER_MARKER_SIZE * 2 + 2,
            },
          })
        } else if (point.style.shape === "hollow") {
          annotationPoints.push({
            x: xLabel,
            y: point.y,
            marker: {
              size: SCATTER_MARKER_SIZE,
              fillColor: "#ffffff",
              strokeColor: point.style.color,
              strokeWidth: 2,
              shape: "circle",
            },
          })
        } else {
          annotationPoints.push({
            x: xLabel,
            y: point.y,
            marker: {
              size: SCATTER_MARKER_SIZE,
              fillColor: point.style.color,
              strokeColor: "#ffffff",
              strokeWidth: 1,
              shape: "circle",
            },
          })
        }
        continue
      }

      // Otherwise fall back to series-level marker + badge tint (BP today).
      const rolled =
        point.badge === "LOW" || point.badge === "HIGH"
          ? "BAD"
          : point.badge === "NORMAL"
            ? "NORMAL"
            : null
      const tint = rolled ? HEALTH_METRIC_BADGE_COLOR[rolled] : s.color

      if (s.marker === "hollow") {
        annotationPoints.push({
          x: xLabel,
          y: point.y,
          marker: {
            size: SCATTER_MARKER_SIZE,
            fillColor: "#ffffff",
            strokeColor: tint,
            strokeWidth: 2,
            shape: "circle",
          },
        })
      } else {
        annotationPoints.push({
          x: xLabel,
          y: point.y,
          marker: {
            size: SCATTER_MARKER_SIZE,
            fillColor: tint,
            strokeColor: "#ffffff",
            strokeWidth: 1,
            shape: "circle",
          },
        })
      }
    }
  }

  /**
   * Legend shows only the aggregated-line names translated for the UI.
   * customLegendItems inherits colors by index from the `colors` array.
   */
  const legendItems = resolvedLegendLabels

  /**
   * Per-series legend marker HTML — so the legend visually matches what's
   * drawn in the chart. If a series has a "hollow" scatter overlay
   * (diastolic BP today) the legend shows a matching ring; otherwise a
   * filled circle. Returned as an array of functions aligned with
   * `customLegendItems` / `resolvedSeries`.
   */
  const legendMarkerHTMLs = resolvedSeries.map((s, i) => {
    const color = resolvedColors[i] ?? "#667085"
    const overlay = resolvedScatter.find((sc) => sc.parentKey === s.name)
    if (overlay?.marker === "hollow") {
      return () =>
        `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;border:2px solid ${color};background:#ffffff;vertical-align:middle;"></span>`
    }
    return () =>
      `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${color};vertical-align:middle;"></span>`
  })

  /**
   * Show the Low / Normal / High classification legend whenever the chart
   * has any classified data point. Metrics without backend classification
   * (hematocrit / hemoglobin / ketone) will have no badges and therefore
   * no legend — matching the data they actually carry.
   */
  const hasClassification =
    (badgesPerSeries ?? []).some((series) =>
      series.some((badge) => badge !== null && badge !== undefined)
    ) ||
    resolvedScatter.some((s) =>
      s.data.some((p) => p.badge !== null && p.badge !== undefined)
    )

  return (
    <div className={className}>
    <LineChart
      chartType={isBarChart ? "bar" : "line"}
      series={resolvedSeries}
      colors={resolvedColors}
      yaxis={resolvedYAxis}
      xaxis={{
        position: "top",
        categories: resolvedCategories,
      }}
      plotOptions={
        isBarChart
          ? {
              bar: {
                columnWidth: "45%",
                borderRadius: 4,
                borderRadiusApplication: "end",
              },
            }
          : undefined
      }
      legend={{
        // Hide legend for BG (custom legend rendered below) and for bar-mode
        // single-metric charts like ketone where the filter pill already
        // names the metric. Keep it for everything else — especially BP,
        // whose systolic/diastolic entries need to be labelled.
        show: !hasBgScatter && !isBarChart,
        position: "bottom",
        horizontalAlign: "center",
        customLegendItems: legendItems,
        markers: {
          // Per-series custom marker HTML so legend reflects filled vs hollow
          // style used in the chart annotations (e.g. diastolic = ring).
          customHTML: legendMarkerHTMLs,
        },
        // customLegendItems removes click-to-toggle, so explicitly disable
        // toggle handlers to avoid misleading cursor affordances.
        onItemClick: { toggleDataSeries: false },
        onItemHover: { highlightDataSeries: false },
      }}
      annotations={{
        // ApexCharts' internal renderer reads all five annotation buckets
        // unconditionally (including on updates), so we must ALWAYS pass the
        // full shape — never omit it or leave any bucket undefined —
        // otherwise `drawImageAnnos` crashes with "Cannot read properties of
        // undefined (reading 'images' / 'map')".
        points: isBarChart ? [] : annotationPoints,
        xaxis: [],
        yaxis: [],
        texts: [],
        images: [],
      }}
      stroke={
        isBarChart
          ? { show: false }
          : {
              curve: "smooth",
              width: 1,
            }
      }
      tooltip={{
        enabled: true,
        shared: false,
        intersect: true,
        followCursor: false,
        hideEmptySeries: true,
        onDatasetHover: {
          highlightDataSeries: true,
        },
        y: {
          title: {
            formatter: (seriesName: string): string => {
              if (!seriesName) return ""
              const lineIndex = resolvedSeries.findIndex(
                (s) => s.name === seriesName
              )
              if (lineIndex >= 0) {
                return resolvedLegendLabels[lineIndex] ?? seriesName
              }
              return seriesName
            },
          },
        },
      }}
      markers={{
        size: markerSizes,
        hover: { sizeOffset: 3 },
        colors: markerColors,
        strokeColors: markerStrokeColors,
        strokeWidth: markerStrokeWidths,
        shape: "circle",
        discrete: discreteMarkers,
      }}
      height={height}
    />
    {hasBgScatter ? (
      <BloodGlucoseChartLegend />
    ) : hasClassification ? (
      <ClassificationLegend className="mt-2" />
    ) : null}
    </div>
  )
}

/**
 * Legend for the Blood Glucose chart. Two clusters:
 *  - Shape cluster: meal context (fasting / before meal / after meal).
 *    Rendered in neutral grey so the viewer understands "shape encodes meal",
 *    independent of classification color.
 *  - Color cluster: backend classification badge (Low / Normal / High).
 *    Rendered as filled circles so the viewer understands "color encodes
 *    classification", independent of meal shape.
 */
const BG_LEGEND_NEUTRAL = "#6B7280" // gray-500, used for shape-only items
const BG_LEGEND_LOW = "#F59E0B"
const BG_LEGEND_NORMAL = "#10B981"
const BG_LEGEND_HIGH = "#EF4444"

const BloodGlucoseChartLegend = () => {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-600">
      <LegendItem
        marker={
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{
              border: `2px solid ${BG_LEGEND_NEUTRAL}`,
              background: "#ffffff",
            }}
          />
        }
        label="Nhịn ăn"
      />
      <LegendItem
        marker={
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{
              // Half-filled: left half neutral, right half white, with border.
              background: `linear-gradient(to right, ${BG_LEGEND_NEUTRAL} 50%, #ffffff 50%)`,
              border: `2px solid ${BG_LEGEND_NEUTRAL}`,
              boxSizing: "border-box",
            }}
          />
        }
        label="Trước ăn"
      />
      <LegendItem
        marker={
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: BG_LEGEND_NEUTRAL }}
          />
        }
        label="Sau ăn / Bất kỳ"
      />
      <span className="hidden h-3 w-px bg-gray-300 sm:inline-block" aria-hidden />
      <ClassificationLegendItems />
    </div>
  )
}

/**
 * Shared Low / Normal / High classification legend. Rendered below any
 * chart that carries classified data points (badge !== null). Matches the
 * palette used by the BG chart so users see a single consistent legend
 * vocabulary across every metric.
 */
const ClassificationLegend = ({ className }: { className?: string }) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-600 ${className ?? ""}`}
    >
      <ClassificationLegendItems />
    </div>
  )
}

const ClassificationLegendItems = () => {
  return (
    <>
      <LegendItem
        marker={
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: BG_LEGEND_LOW }}
          />
        }
        label="Thấp"
      />
      <LegendItem
        marker={
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: BG_LEGEND_NORMAL }}
          />
        }
        label="Bình thường"
      />
      <LegendItem
        marker={
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: BG_LEGEND_HIGH }}
          />
        }
        label="Cao"
      />
    </>
  )
}

const LegendItem = ({
  marker,
  label,
}: {
  marker: ReactNode
  label: string
}) => {
  return (
    <span className="inline-flex items-center gap-1.5">
      {marker}
      <span>{label}</span>
    </span>
  )
}
