"use client"

import { LineChart } from "./LineChart"

type ChartSeries = {
  name: string
  data: Array<number | null>
}

interface Props {
  series?: ChartSeries[]
  colors?: string[]
  categories?: string[]
  yaxis?: {
    min: number
    max: number
    tickAmount: number
  }
  height?: number | string
  className?: string
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
  yaxis,
  height = 350,
}: Props) => {
  const resolvedSeries = series ?? []
  const resolvedColors = colors ?? []
  const resolvedCategories = categories ?? []
  const resolvedYAxis = yaxis ?? defaultYAxis

  const resolveTooltipIndex = (
    index: number,
    fallbackIndex: unknown
  ): number => {
    if (Number.isInteger(index) && index >= 0) return index
    return Number.isInteger(fallbackIndex) && Number(fallbackIndex) >= 0
      ? Number(fallbackIndex)
      : -1
  }

  return (
    <LineChart
      className={className}
      series={resolvedSeries}
      colors={resolvedColors}
      yaxis={resolvedYAxis}
      xaxis={{
        position: "top",
        categories: resolvedCategories,
      }}
      tooltip={{
        enabled: true,
        shared: false,
        intersect: true,
        followCursor: false,
        hideEmptySeries: true,
        onDatasetHover: {
          highlightDataSeries: true,
        },
        custom:
          resolvedSeries.length > 0
            ? ({ series: sr, seriesIndex, dataPointIndex, w }) => {
                const activeSeriesIndex = resolveTooltipIndex(
                  seriesIndex,
                  w?.globals?.capturedSeriesIndex
                )
                const activeDataPointIndex = resolveTooltipIndex(
                  dataPointIndex,
                  w?.globals?.capturedDataPointIndex
                )

                if (
                  activeSeriesIndex < 0 ||
                  activeDataPointIndex < 0 ||
                  !sr?.[activeSeriesIndex]
                ) {
                  return ""
                }

                const value = sr[activeSeriesIndex]?.[activeDataPointIndex]
                const label = resolvedSeries[activeSeriesIndex]?.name ?? ""
                const color = resolvedColors[activeSeriesIndex] ?? "#667085"
                const category =
                  resolvedCategories[activeDataPointIndex] ??
                  w?.globals?.categoryLabels?.[activeDataPointIndex] ??
                  ""

                if (value === null || value === undefined) return ""

                return `<div style="padding: 8px 10px; background: white; border: 1px solid ${color}; border-radius: 8px; color: #101828">
  <div style="font-size: 11px; color: #667085; margin-bottom: 2px;">${category}</div>
  <div style="font-size: 12px; font-weight: 600; color: ${color}; margin-bottom: 2px;">${label}</div>
  <strong>${value}</strong>
</div>`
              }
            : undefined,
      }}
      markers={{
        size: 6,
        hover: { sizeOffset: 4 },
        colors: resolvedColors,
        strokeColors: "#fff",
        strokeWidth: 1,
        shape: "circle",
      }}
      height={height}
    />
  )
}
