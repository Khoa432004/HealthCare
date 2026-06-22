import type { MetricType } from "../../../ysalus-metrics/types"

import { MetricLineChartPanel } from "../MetricLineChartPanel"
import type { MetricsTrackerLineChartProps } from "./types"

export function GenericMetricLineTrackerChart({
  metricType,
  ...props
}: MetricsTrackerLineChartProps & { metricType: MetricType }) {
  return <MetricLineChartPanel {...props} metricType={metricType} />
}
