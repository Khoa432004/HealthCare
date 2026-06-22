import { MetricType } from "../../../ysalus-metrics/types"

import { MetricLineChartPanel } from "../MetricLineChartPanel"
import type { MetricsTrackerLineChartProps } from "./types"

export function HemoglobinMetricsTrackerChart(
  props: MetricsTrackerLineChartProps
) {
  return (
    <MetricLineChartPanel {...props} metricType={MetricType.Hemoglobin} />
  )
}
