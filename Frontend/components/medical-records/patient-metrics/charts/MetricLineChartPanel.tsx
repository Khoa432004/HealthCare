"use client"

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import useBreakpoint from "@/hooks/use-breakpoint"
import { MetricType, type MetricDetail } from "../../ysalus-metrics/types"

import { METRIC_TYPE_I18N_KEY, type MetricsGranularity } from "../constants"
import { useTranslation } from "../i18n"
import { MetricLineChartBands } from "./metric-line-chart/MetricLineChartBands"
import { MetricLineChartBarSeries } from "./metric-line-chart/MetricLineChartBarSeries"
import { MetricLineChartEmptyState } from "./metric-line-chart/MetricLineChartEmptyState"
import { MetricLineChartLineSeries } from "./metric-line-chart/MetricLineChartLineSeries"
import { MetricLineChartYAxisGrid } from "./metric-line-chart/MetricLineChartYAxisGrid"
import type { MetricsChartTooltipModel } from "./MetricsChartTooltip"
import { MetricsChartTooltip } from "./MetricsChartTooltip"
import { MetricsTrackerStatusLegend } from "./MetricsTrackerStatusLegend"
import { MetricsTrackerTimelineAxis } from "./MetricsTrackerTimelineAxis"
import {
  buildMetricSeries,
  buildTicks,
  expandChartScaleToFitSeries,
  getChartScale,
  type TimelinePoint,
} from "./metricsTrackerChart.utils"

export type MetricLineChartPanelProps = {
  metricType: MetricType
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

export function MetricLineChartPanel({
  metricType,
  details,
  timeline,
  granularity,
  start,
  end,
  onSelectDate,
}: MetricLineChartPanelProps) {
  const { t } = useTranslation()
  const { isAtLeast } = useBreakpoint()
  const isLgUp = isAtLeast("lg")
  const baseScale = useMemo(() => getChartScale(metricType), [metricType])
  const series = useMemo(
    () =>
      buildMetricSeries(details, metricType, timeline, granularity, start, end),
    [details, end, granularity, metricType, start, timeline]
  )
  const scale = useMemo(
    () => expandChartScaleToFitSeries(baseScale, series),
    [baseScale, series]
  )
  const ticks = useMemo(() => buildTicks(scale), [scale])
  const hasPoints = series.some((item) => item.points.some(Boolean))
  const isBarChart = metricType === MetricType.Ketone

  // Width of the sticky Y-axis column that lives OUTSIDE the scrolling SVG.
  // The chart SVG itself uses plotLeft=0 because its tick labels live in this
  // sticky column instead of inside the SVG (so they don't scroll away).
  const yAxisColumnWidth = 58
  const plotLeft = 0
  const plotRight = 22
  const plotTop = 12
  const plotHeight = 250
  const svgHeight = 310

  // Total minimum width across BOTH columns (sticky Y-axis + chart).
  const totalMinWidth = useMemo(
    () =>
      Math.max(
        isLgUp ? 920 : 288,
        yAxisColumnWidth + plotRight + timeline.length * (isLgUp ? 48 : 28)
      ),
    [isLgUp, timeline.length]
  )

  // Ref on the scrolling chart column (right cell) — used to size the SVG so
  // it fills the available horizontal space when there's room to spare.
  const chartColumnRef = useRef<HTMLDivElement>(null)
  const [chartColumnWidthPx, setChartColumnWidthPx] = useState(0)

  useLayoutEffect(() => {
    const node = chartColumnRef.current
    if (!node) return

    const measure = () => {
      const w = node.getBoundingClientRect().width
      setChartColumnWidthPx(Number.isFinite(w) ? w : 0)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(node)
    return () => ro.disconnect()
  }, [timeline.length, totalMinWidth])

  const chartInnerMinWidth = totalMinWidth - yAxisColumnWidth
  const svgWidth = useMemo(() => {
    if (chartColumnWidthPx <= 0) return chartInnerMinWidth
    return Math.max(chartInnerMinWidth, Math.round(chartColumnWidthPx))
  }, [chartInnerMinWidth, chartColumnWidthPx])

  const plotWidth = svgWidth - plotLeft - plotRight
  const slotWidth = plotWidth / Math.max(timeline.length, 1)
  const getX = (index: number) =>
    plotLeft + slotWidth * index + slotWidth / 2
  const getY = (value: number) =>
    plotTop +
    ((scale.max - value) / (scale.max - scale.min || 1)) * plotHeight

  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const onPointHover = useCallback(
    (
      next: {
        model: MetricsChartTooltipModel
        clientX: number
        clientY: number
      } | null
    ) => {
      if (!next) {
        setTooltip(null)
        return
      }
      setTooltip({
        ...next.model,
        anchorX: next.clientX,
        anchorY: next.clientY,
      })
    },
    []
  )

  return (
    <>
      <div className="overflow-x-auto">
        <div
          className="relative grid box-border w-full min-w-0 pb-1"
          style={{
            minWidth: totalMinWidth,
            gridTemplateColumns: `${yAxisColumnWidth}px 1fr`,
          }}
        >
          {/*
           * Row 1 — top axis. The left cell is an empty sticky spacer that
           * aligns vertically with the timeline axis on the right. Sticky on
           * `left:0` so it pins to the viewport's left edge as the user scrolls.
           */}
          <div className="sticky left-0 z-[2] bg-white" aria-hidden="true" />
          <div className="min-w-0">
            <MetricsTrackerTimelineAxis
              timeline={timeline}
              leftWidth={0}
              rightWidth={plotRight}
              onSelectDate={onSelectDate}
            />
          </div>

          {/* Row 2 — chart body. Left cell is the frozen Y-axis labels. */}
          <div className="sticky left-0 z-[2] bg-white">
            <svg
              className="mt-2 block"
              width={yAxisColumnWidth}
              height={svgHeight}
              viewBox={`0 0 ${yAxisColumnWidth} ${svgHeight}`}
              aria-hidden="true"
            >
              <MetricLineChartYAxisGrid
                scale={scale}
                ticks={ticks}
                plotLeft={yAxisColumnWidth}
                plotWidth={0}
                getY={getY}
                mode="labels"
              />
            </svg>
          </div>

          <div ref={chartColumnRef} className="min-w-0">
            <svg
              className="mt-2 block"
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              role="img"
              aria-label={`${t(METRIC_TYPE_I18N_KEY[metricType])} chart`}
              onMouseLeave={() => setTooltip(null)}
            >
              <MetricLineChartBands
                scale={scale}
                plotLeft={plotLeft}
                plotWidth={plotWidth}
                getY={getY}
              />

              <MetricLineChartYAxisGrid
                scale={scale}
                ticks={ticks}
                plotLeft={plotLeft}
                plotWidth={plotWidth}
                getY={getY}
                mode="lines"
              />

              {isBarChart ? (
                <MetricLineChartBarSeries
                  series={series}
                  timeline={timeline}
                  granularity={granularity}
                  metricType={metricType}
                  scaleMin={scale.min}
                  slotWidth={slotWidth}
                  getX={getX}
                  getY={getY}
                  t={t}
                  onPointHover={onPointHover}
                />
              ) : (
                <MetricLineChartLineSeries
                  series={series}
                  timeline={timeline}
                  granularity={granularity}
                  metricType={metricType}
                  getX={getX}
                  getY={getY}
                  slotWidth={slotWidth}
                  t={t}
                  onPointHover={onPointHover}
                />
              )}

              {!hasPoints ? (
                <MetricLineChartEmptyState
                  message={t("noDataAvailable")}
                  plotLeft={plotLeft}
                  plotWidth={plotWidth}
                  plotTop={plotTop}
                  plotHeight={plotHeight}
                />
              ) : null}
            </svg>
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

      <MetricsTrackerStatusLegend metricType={metricType} />
    </>
  )
}
