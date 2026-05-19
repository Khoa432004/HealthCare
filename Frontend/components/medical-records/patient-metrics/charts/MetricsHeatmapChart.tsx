"use client"

import { useMemo, useState } from "react"

import useBreakpoint from "@/hooks/use-breakpoint"
import type { MetricDetail } from "../../ysalus-metrics/types"

import {
  METRIC_HEATMAP_ROW_ORDER,
  METRIC_TYPE_I18N_KEY,
  type MetricsGranularity,
} from "../constants"
import { useTranslation } from "../i18n"
import { METRIC_SEVERITY_STYLE } from "../utils/metricSeverity"
import { buildHeatmapCellTooltip } from "./metricsHeatmapTooltip"
import type { MetricsChartTooltipModel } from "./MetricsChartTooltip"
import { MetricsChartTooltip } from "./MetricsChartTooltip"
import {
  buildHeatmapCellMeasures,
  buildHeatmapStatus,
  EMPTY_DOT_COLOR,
  type TimelinePoint,
} from "./metricsTrackerChart.utils"
import { MetricsTrackerStatusLegend } from "./MetricsTrackerStatusLegend"
import { MetricsTrackerTimelineAxis } from "./MetricsTrackerTimelineAxis"

type Props = {
  details: MetricDetail[]
  timeline: TimelinePoint[]
  granularity: MetricsGranularity
  start: Date
  end: Date
  onSelectDate: (date: Date) => void
}

type TooltipState = MetricsChartTooltipModel & {
  anchorX: number
  anchorY: number
}

export function MetricsHeatmapChart({
  details,
  timeline,
  granularity,
  start,
  end,
  onSelectDate,
}: Props) {
  const { t } = useTranslation()
  const { isAtLeast } = useBreakpoint()
  const isLgUp = isAtLeast("lg")
  const labelColumnPx = isLgUp ? 170 : 112
  const slotMinPx = isLgUp ? 42 : 26
  const chartMinWidth = Math.max(
    isLgUp ? 920 : 288,
    labelColumnPx + timeline.length * slotMinPx
  )

  const statusMap = useMemo(
    () => buildHeatmapStatus(details, timeline, granularity, start, end),
    [details, end, granularity, start, timeline]
  )
  const measureMap = useMemo(
    () => buildHeatmapCellMeasures(details, timeline, granularity, start, end),
    [details, end, granularity, start, timeline]
  )
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  return (
    <>
      <div className="overflow-x-auto">
        <div
          className="relative w-full min-w-0 pb-1"
          style={{ minWidth: chartMinWidth }}
          onMouseLeave={() => setTooltip(null)}
        >
          {/*
           * Timeline axis: empty first cell becomes a sticky spacer so the
           * leading edge stays put while the user scrolls horizontally.
           */}
          <div
            className="grid w-full min-w-0 items-center"
            style={{
              gridTemplateColumns: `${labelColumnPx}px 1fr`,
            }}
          >
            <div className="sticky left-0 z-[2] bg-white" aria-hidden="true" />
            <div className="min-w-0">
              <MetricsTrackerTimelineAxis
                timeline={timeline}
                leftWidth={0}
                onSelectDate={onSelectDate}
              />
            </div>
          </div>

          <div className="mt-4 flex w-full min-w-0 flex-col gap-4 lg:gap-5">
            {METRIC_HEATMAP_ROW_ORDER.map((metricType) => (
              <div
                key={metricType}
                className="grid w-full min-w-0 items-center"
                style={{
                  gridTemplateColumns: `${labelColumnPx}px repeat(${timeline.length}, minmax(0, 1fr))`,
                }}
              >
                <span className="sticky left-0 z-[2] min-w-0 bg-white pr-2 text-sm font-medium leading-snug text-gray-950 lg:text-base">
                  {t(METRIC_TYPE_I18N_KEY[metricType])}
                </span>

                {timeline.map((point) => {
                  const severity = statusMap.get(metricType)?.get(point.key)
                  const measure =
                    measureMap.get(metricType)?.get(point.key) ?? null
                  const tip = buildHeatmapCellTooltip(t, {
                    metricType,
                    periodDate: point.date,
                    granularity,
                    severity,
                    measure,
                  })

                  return (
                    <button
                      key={`${metricType}-${point.key}`}
                      type="button"
                      onClick={() => onSelectDate(point.date)}
                      className="min-w-0 justify-self-center size-5 max-w-full rounded-full transition hover:scale-110 lg:size-6"
                      style={{
                        backgroundColor: severity
                          ? METRIC_SEVERITY_STYLE[severity].color
                          : EMPTY_DOT_COLOR,
                      }}
                      aria-label={`${metricType} ${point.label}`}
                      onMouseEnter={(e) =>
                        setTooltip({
                          anchorX: e.clientX,
                          anchorY: e.clientY,
                          ...tip,
                        })
                      }
                      onMouseMove={(e) =>
                        setTooltip({
                          anchorX: e.clientX,
                          anchorY: e.clientY,
                          ...tip,
                        })
                      }
                      onMouseLeave={() => setTooltip(null)}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {tooltip ? (
            <MetricsChartTooltip
              anchorX={tooltip.anchorX}
              anchorY={tooltip.anchorY}
              title={tooltip.title}
              indicatorLabel={tooltip.indicatorLabel}
              valueLabel={tooltip.valueLabel}
              statusLabel={tooltip.statusLabel}
              severity={tooltip.severity}
              detailLines={tooltip.detailLines}
            />
          ) : null}
        </div>
      </div>

      <MetricsTrackerStatusLegend metricType={null} />
    </>
  )
}
