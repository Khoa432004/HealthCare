import type { MouseEvent } from "react"

import { MetricType } from "../../../ysalus-metrics/types"

import type { MetricsGranularity } from "../../constants"
import type { TFunction } from "../../i18n"
import { METRIC_SEVERITY_STYLE } from "../../utils/metricSeverity"
import { buildLineChartPointTooltip } from "../metricLineChartTooltip"
import type { MetricsChartTooltipModel } from "../MetricsChartTooltip"
import type { LineSeries, TimelinePoint } from "../metricsTrackerChart.utils"

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
  scaleMin: number
  slotWidth: number
  getX: (index: number) => number
  getY: (value: number) => number
  t: TFunction
  onPointHover: (next: HoverPayload | null) => void
}

export function MetricLineChartBarSeries({
  series,
  timeline,
  granularity,
  metricType,
  scaleMin,
  slotWidth,
  getX,
  getY,
  t,
  onPointHover,
}: Props) {
  const points = series[0]?.points ?? []

  return (
    <>
      {points.map((point, index) => {
        if (!point) return null

        const barWidth = Math.min(28, slotWidth * 0.46)
        const x = getX(index) - barWidth / 2
        const y = getY(point.value)
        const height = getY(scaleMin) - y
        const periodDate = timeline[index]?.date

        const fireHover = (e: MouseEvent<SVGRectElement>) => {
          if (!periodDate) return
          onPointHover({
            model: buildLineChartPointTooltip(t, {
              metricType,
              seriesId: String(metricType),
              point,
              periodDate,
              granularity,
            }),
            clientX: e.clientX,
            clientY: e.clientY,
          })
        }

        return (
          <rect
            key={point.key}
            x={x}
            y={y}
            width={barWidth}
            height={height}
            rx={6}
            fill={METRIC_SEVERITY_STYLE[point.severity].color}
            onMouseEnter={fireHover}
            onMouseMove={fireHover}
            onMouseLeave={() => onPointHover(null)}
            className="cursor-pointer"
          />
        )
      })}
    </>
  )
}
