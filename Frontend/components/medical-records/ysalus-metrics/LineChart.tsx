"use client"

import type { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"

// react-apexcharts pulls `window`; disable SSR in Next.js.
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
})

interface Props {
  series: { name?: string; data: (number | null)[] }[]
  colors?: string[]
  markers?: ApexMarkers
  tooltip?: ApexTooltip
  xaxis?: ApexXAxis
  yaxis?: ApexYAxis
  className?: string
  height?: string | number
  width?: string | number
  showGrid?: boolean
}

export const LineChart = ({
  series,
  colors,
  markers,
  tooltip,
  xaxis,
  yaxis,
  className,
  height,
  width,
  showGrid = true,
}: Props) => {
  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: 1,
    },
    markers: markers ?? { size: 4 },
    tooltip: tooltip ?? { enabled: true },
    colors,
    grid: {
      show: showGrid,
      strokeDashArray: 7,
    },
    yaxis,
    xaxis,
  }

  return (
    <div className={className}>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={height}
        width={width}
      />
    </div>
  )
}
