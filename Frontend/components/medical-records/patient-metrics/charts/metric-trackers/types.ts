import type { MetricLineChartPanelProps } from "../MetricLineChartPanel"

export type MetricsTrackerLineChartProps = Omit<
  MetricLineChartPanelProps,
  "metricType"
>
