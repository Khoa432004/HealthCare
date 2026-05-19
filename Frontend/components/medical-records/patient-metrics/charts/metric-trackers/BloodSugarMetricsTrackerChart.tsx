import { MetricType } from "../../../ysalus-metrics/types"

import { MetricLineChartPanel } from "../MetricLineChartPanel"
import type { MetricsTrackerLineChartProps } from "./types"

export function BloodSugarMetricsTrackerChart(
  props: MetricsTrackerLineChartProps
) {
  return (
    <MetricLineChartPanel {...props} metricType={MetricType.BloodSugar} />
  )
}
