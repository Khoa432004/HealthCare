type Props = {
  message: string
  plotLeft: number
  plotWidth: number
  plotTop: number
  plotHeight: number
}

export function MetricLineChartEmptyState({
  message,
  plotLeft,
  plotWidth,
  plotTop,
  plotHeight,
}: Props) {
  return (
    <text
      x={plotLeft + plotWidth / 2}
      y={plotTop + plotHeight / 2}
      textAnchor="middle"
      className="fill-gray-400 text-sm font-medium"
    >
      {message}
    </text>
  )
}
