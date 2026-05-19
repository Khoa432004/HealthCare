import { MetricType } from "../../../ysalus-metrics/types"

import { MetricLineChartPanel } from "../MetricLineChartPanel"
import type { MetricsTrackerLineChartProps } from "./types"

export function UricAcidMetricsTrackerChart(
  props: MetricsTrackerLineChartProps
) {
  return <MetricLineChartPanel {...props} metricType={MetricType.UricAcid} />
}
