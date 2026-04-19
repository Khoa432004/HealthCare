"use client"

import { useMemo } from "react"

import { HealthMetricsChart } from "./HealthMetricsChart"
import type {
  HealthMetricChartKey,
  HealthMetricDateRange,
  HealthMetricsChartData,
} from "./healthMetricsChart.utils"
import {
  buildHealthMetricChartData,
  getHealthMetricColor,
  getHealthMetricLabel,
} from "./healthMetricsChart.utils"
import type { MetricData } from "./types"

interface Props {
  metricsData?: MetricData[]
  metricKey?: HealthMetricChartKey | string | null
  metricKeys?: Array<HealthMetricChartKey | string>
  dateRange?: HealthMetricDateRange
  height?: number | string
  className?: string
}

export const HealthMetricsChartContainer = ({
  metricsData,
  metricKey,
  metricKeys,
  dateRange = "week",
  height,
  className,
}: Props) => {
  const resolvedMetricKeys = useMemo(() => {
    if (metricKeys?.length) return metricKeys
    return metricKey ? [metricKey] : []
  }, [metricKey, metricKeys])

  const chartData = useMemo<HealthMetricsChartData>(() => {
    return buildHealthMetricChartData(
      metricsData ?? [],
      resolvedMetricKeys,
      dateRange
    )
  }, [dateRange, metricsData, resolvedMetricKeys])

  const chartSeries = useMemo(
    () =>
      chartData.series.map((series) => ({
        ...series,
        name: getHealthMetricLabel(series.name as HealthMetricChartKey),
      })),
    [chartData.series]
  )

  const chartColors = useMemo(
    () =>
      chartData.series.map((series) =>
        getHealthMetricColor(series.name as HealthMetricChartKey)
      ),
    [chartData.series]
  )

  return (
    <HealthMetricsChart
      className={className}
      series={chartSeries}
      categories={chartData.categories}
      colors={chartColors}
      yaxis={chartData.yAxis}
      height={height}
    />
  )
}
