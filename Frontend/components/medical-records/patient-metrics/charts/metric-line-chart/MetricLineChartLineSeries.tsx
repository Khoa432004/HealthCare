import type { MouseEvent } from "react"

import { MetricType } from "../../../ysalus-metrics/types"

import type { MetricsGranularity } from "../../constants"
import type { TFunction } from "../../i18n"
import { METRIC_SEVERITY_STYLE } from "../../utils/metricSeverity"
import {
  buildLineChartPointTooltip,
  buildLineChartRawPointTooltip,
} from "../metricLineChartTooltip"
import type { MetricsChartTooltipModel } from "../MetricsChartTooltip"
import {
  buildPath,
  DEFAULT_LINE_COLOR,
  type LineSeries,
  type RawChartShape,
  type TimelinePoint,
} from "../metricsTrackerChart.utils"

/**
 * Renders a single dot in one of three shapes (filled disc, hollow ring, or
 * half-filled circle). Half-fill is drawn as a filled left semicircle plus a
 * full-circle stroke so the dot reads as "half coloured" against the chart.
 */
function RawDotShape({
  cx,
  cy,
  r,
  color,
  shape,
}: {
  cx: number
  cy: number
  r: number
  color: string
  shape: RawChartShape
}) {
  if (shape === "half") {
    const leftHalfPath = `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`
    return (
      <g pointerEvents="none">
        <circle cx={cx} cy={cy} r={r} fill="white" stroke={color} strokeWidth={2} />
        <path d={leftHalfPath} fill={color} />
      </g>
    )
  }
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={shape === "hollow" ? "white" : color}
      stroke={color}
      strokeWidth={2}
      pointerEvents="none"
    />
  )
}

type HoverPayload = {
  model: MetricsChartTooltipModel
  clientX: number
  clientY: number
}

type Props = {
  series: LineSeries[]
  timeline: TimelinePoint[]
  granularity: MetricsGranularity
  metricType: MetricType
  getX: (index: number) => number
  getY: (value: number) => number
  /** Width of one timeline slot in SVG units — used to spread raw dots inside the slot. */
  slotWidth: number
  t: TFunction
  onPointHover: (next: HoverPayload | null) => void
}

export function MetricLineChartLineSeries({
  series,
  timeline,
  granularity,
  metricType,
  getX,
  getY,
  slotWidth,
  t,
  onPointHover,
}: Props) {
  return (
    <>
      {series.map((item) => {
        const path = buildPath(item.points, getX, getY)
        // Prefer rendering one dot per raw measurement so multiple readings
        // on the same day are all visible. Fall back to "1 dot per averaged
        // bucket" if the series wasn't built with raw points (back-compat).
        const hasRawPoints = !!item.rawPoints && item.rawPoints.length > 0

        return (
          <g key={item.id}>
            {path ? (
              <path
                d={path}
                fill="none"
                stroke={DEFAULT_LINE_COLOR}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            ) : null}

            {hasRawPoints
              ? item.rawPoints!.map((raw) => {
                  const color = METRIC_SEVERITY_STYLE[raw.severity].color
                  const cx = getX(raw.timelineIndex) + raw.xFraction * slotWidth
                  const cy = getY(raw.value)
                  const periodDate = timeline[raw.timelineIndex]?.date

                  // Resolve final shape: per-point shape wins (used by BG
                  // meal context); otherwise fall back to the series marker.
                  const shape =
                    raw.shape ?? (item.marker === "outlined" ? "hollow" : "filled")

                  const showTip = (e: MouseEvent<SVGCircleElement>) => {
                    if (!periodDate) return
                    onPointHover({
                      model: buildLineChartRawPointTooltip(t, {
                        metricType,
                        seriesId: item.id,
                        rawPoint: raw,
                        periodDate,
                        granularity,
                      }),
                      clientX: e.clientX,
                      clientY: e.clientY,
                    })
                  }

                  return (
                    <g key={`${item.id}-raw-${raw.id}`}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={12}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={showTip}
                        onMouseMove={showTip}
                        onMouseLeave={() => onPointHover(null)}
                      />
                      <RawDotShape cx={cx} cy={cy} r={5} color={color} shape={shape} />
                    </g>
                  )
                })
              : item.points.map((point, index) => {
                  if (!point) return null

                  const color = METRIC_SEVERITY_STYLE[point.severity].color
                  const cx = getX(index)
                  const cy = getY(point.value)
                  const periodDate = timeline[index]?.date

                  const showTip = (e: MouseEvent<SVGCircleElement>) => {
                    if (!periodDate) return
                    onPointHover({
                      model: buildLineChartPointTooltip(t, {
                        metricType,
                        seriesId: item.id,
                        point,
                        periodDate,
                        granularity,
                      }),
                      clientX: e.clientX,
                      clientY: e.clientY,
                    })
                  }

                  return (
                    <g key={`${item.id}-${point.key}`}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={14}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={showTip}
                        onMouseMove={showTip}
                        onMouseLeave={() => onPointHover(null)}
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill={item.marker === "outlined" ? "white" : color}
                        stroke={color}
                        strokeWidth={2}
                        pointerEvents="none"
                      />
                    </g>
                  )
                })}
          </g>
        )
      })}
    </>
  )
}
