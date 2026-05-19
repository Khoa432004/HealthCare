import {
  AXIS_COLOR,
  formatTick,
  GRID_COLOR,
  type ChartScale,
} from "../metricsTrackerChart.utils"

type Props = {
  scale: ChartScale
  ticks: number[]
  plotLeft: number
  plotWidth: number
  getY: (value: number) => number
  /**
   * Controls what gets rendered:
   *  - "both"  : grid lines + labels (legacy single-SVG layout)
   *  - "lines" : grid lines only — used by the scrollable chart SVG
   *  - "labels": labels only — used by the sticky Y-axis SVG
   *
   * Splitting allows the Y-axis labels to live in a separate, position:sticky
   * column so they stay visible while the chart scrolls horizontally.
   */
  mode?: "both" | "lines" | "labels"
}

export function MetricLineChartYAxisGrid({
  scale,
  ticks,
  plotLeft,
  plotWidth,
  getY,
  mode = "both",
}: Props) {
  const renderLabels = mode === "both" || mode === "labels"
  const renderLines = mode === "both" || mode === "lines"

  return (
    <>
      {ticks.map((tick) => {
        const y = getY(tick)

        return (
          <g key={tick}>
            {renderLabels ? (
              <text
                x={plotLeft - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-gray-600 text-sm font-medium"
              >
                {formatTick(tick)}
              </text>
            ) : null}
            {renderLines ? (
              <line
                x1={plotLeft}
                x2={plotLeft + plotWidth}
                y1={y}
                y2={y}
                stroke={tick === scale.min ? AXIS_COLOR : GRID_COLOR}
                strokeWidth={tick === scale.min ? 1.2 : 1}
              />
            ) : null}
          </g>
        )
      })}
    </>
  )
}
