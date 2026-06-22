import type { ChartScale } from "../metricsTrackerChart.utils"

type Props = {
  scale: ChartScale
  plotLeft: number
  plotWidth: number
  getY: (value: number) => number
}

export function MetricLineChartBands({
  scale,
  plotLeft,
  plotWidth,
  getY,
}: Props) {
  return (
    <>
      {scale.bands?.map((band) => {
        const y = getY(band.to)
        const height = getY(band.from) - y

        return (
          <g key={`${band.from}-${band.to}`}>
            <rect
              x={plotLeft}
              y={y}
              width={plotWidth}
              height={height}
              fill="#EEF9F5"
            />
            {band.label ? (
              <text
                x={plotLeft + plotWidth - 6}
                y={y + height / 2 + 4}
                textAnchor="end"
                className="fill-gray-400 text-[10px] font-bold"
              >
                {band.label}
              </text>
            ) : null}
          </g>
        )
      })}
    </>
  )
}
