"use client"

import { useMemo } from "react"

import { MetricType, type MetricData } from "../../ysalus-metrics/types"

import type { MetricsGranularity } from "../constants"
import {
  BloodPressureMetricsTrackerChart,
  BloodSugarMetricsTrackerChart,
  CholesterolMetricsTrackerChart,
  GenericMetricLineTrackerChart,
  HeartRateMetricsTrackerChart,
  HematocritMetricsTrackerChart,
  HemoglobinMetricsTrackerChart,
  KetoneMetricsTrackerChart,
  type MetricsTrackerLineChartProps,
  UricAcidMetricsTrackerChart,
} from "./metric-trackers"
import { MetricsHeatmapChart } from "./MetricsHeatmapChart"
import {
  buildTimeline,
  flattenMetricDetails,
  getPeriodRange,
} from "./metricsTrackerChart.utils"

interface Props {
  activeMetricType: MetricType | null
  anchorDate: Date
  granularity: MetricsGranularity
  metrics: MetricData[]
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

function renderLineChart(
  activeMetricType: MetricType,
  lineProps: MetricsTrackerLineChartProps
) {
  switch (activeMetricType) {
    case MetricType.BloodPressure:
      return <BloodPressureMetricsTrackerChart {...lineProps} />
    case MetricType.HeartRate:
      return <HeartRateMetricsTrackerChart {...lineProps} />
    case MetricType.BloodSugar:
      return <BloodSugarMetricsTrackerChart {...lineProps} />
    case MetricType.Ketone:
      return <KetoneMetricsTrackerChart {...lineProps} />
    case MetricType.Hemoglobin:
      return <HemoglobinMetricsTrackerChart {...lineProps} />
    case MetricType.Hematocrit:
      return <HematocritMetricsTrackerChart {...lineProps} />
    case MetricType.Cholesterol:
      return <CholesterolMetricsTrackerChart {...lineProps} />
    case MetricType.UricAcid:
      return <UricAcidMetricsTrackerChart {...lineProps} />
    default:
      return (
        <GenericMetricLineTrackerChart
          {...lineProps}
          metricType={activeMetricType}
        />
      )
  }
}

export function MetricsTrackerChart({
  activeMetricType,
  anchorDate,
  granularity,
  metrics,
  selectedDate,
  onSelectDate,
}: Props) {
  const details = useMemo(() => flattenMetricDetails(metrics), [metrics])
  const range = useMemo(
    () => getPeriodRange(granularity, anchorDate),
    [anchorDate, granularity]
  )
  const timeline = useMemo(
    () => buildTimeline(granularity, anchorDate, selectedDate),
    [anchorDate, granularity, selectedDate]
  )

  const lineProps: MetricsTrackerLineChartProps = {
    details,
    timeline,
    granularity,
    start: range.start,
    end: range.end,
    onSelectDate,
  }

  if (!activeMetricType) {
    return (
      <MetricsHeatmapChart
        details={details}
        timeline={timeline}
        granularity={granularity}
        start={range.start}
        end={range.end}
        onSelectDate={onSelectDate}
      />
    )
  }

  return renderLineChart(activeMetricType, lineProps)
}
