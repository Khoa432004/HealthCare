"use client"

import type { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"

// react-apexcharts pulls `window`; disable SSR in Next.js.
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
})

/**
 * Mixed-chart friendly series item. `type` lets a single chart contain both
 * `line` and `scatter` series; `data` accepts either the simple parallel-
 * to-categories number array OR ApexCharts {x, y} pairs (used by the BP
 * scatter overlay so multiple measurements can share an x category).
 */
type LineChartSeries = {
  name?: string
  type?: "line" | "scatter"
  data:
    | Array<number | null>
    | Array<{ x: string | number; y: number | null }>
}

interface Props {
  series: LineChartSeries[]
  colors?: string[]
  markers?: ApexMarkers
  stroke?: ApexStroke
  tooltip?: ApexTooltip
  xaxis?: ApexXAxis
  yaxis?: ApexYAxis
  legend?: ApexLegend
  annotations?: ApexAnnotations
  plotOptions?: ApexPlotOptions
  dataLabels?: ApexDataLabels
  /**
   * Top-level chart mode. Defaults to "line" so existing callers keep
   * working; metrics like ketone flip to "bar" (column chart).
   */
  chartType?: "line" | "bar"
  className?: string
  height?: string | number
  width?: string | number
  showGrid?: boolean
}

export const LineChart = ({
  series,
  colors,
  markers,
  stroke,
  tooltip,
  xaxis,
  yaxis,
  legend,
  annotations,
  plotOptions,
  dataLabels,
  chartType = "line",
  className,
  height,
  width,
  showGrid = true,
}: Props) => {
  // ApexCharts reads `config.plotOptions.line.isSlopeChart` unconditionally
  // during globalVars init (even when chart.type === "bar"). If react-apexcharts
  // ever calls updateOptions with a user-supplied `plotOptions` that drops the
  // `.line` branch, the next render can crash with "Cannot read properties of
  // undefined (reading 'line')". We defensively merge a safe `.line` default
  // into every `plotOptions` we pass through.
  const mergedPlotOptions: ApexPlotOptions = {
    ...(plotOptions ?? {}),
    line: {
      isSlopeChart: false,
      ...(plotOptions?.line ?? {}),
    },
  }

  const options: ApexOptions = {
    chart: {
      // `line` is the canonical mixed-chart base — per-series `type: "scatter"`
      // entries opt-out of the line and render markers only. Bar mode is
      // opt-in via `chartType` for column-style metrics like ketone.
      type: chartType,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    // Stroke & markers are line-chart concerns; skip them in bar mode unless
    // the caller explicitly provides overrides.
    stroke:
      stroke ??
      (chartType === "bar"
        ? { show: false }
        : { curve: "smooth", width: 1 }),
    markers: markers ?? (chartType === "bar" ? { size: 0 } : { size: 4 }),
    tooltip: tooltip ?? { enabled: true },
    dataLabels: dataLabels ?? { enabled: false },
    plotOptions: mergedPlotOptions,
    colors,
    grid: {
      show: showGrid,
      strokeDashArray: 7,
    },
    yaxis,
    xaxis,
  }

  if (legend) options.legend = legend
  if (annotations) options.annotations = annotations

  return (
    <div className={className}>
      <ReactApexChart
        options={options}
        // `series` accepts both number[] (line) and {x,y}[] (scatter overlay).
        // Cast widens to ApexCharts' looser runtime type.
        series={series as unknown as ApexAxisChartSeries}
        type={chartType}
        height={height}
        width={width}
      />
    </div>
  )
}
