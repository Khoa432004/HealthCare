import type { MetricType } from "../../ysalus-metrics/types"

import { METRIC_TYPE_I18N_KEY, type MetricsGranularity } from "../constants"
import type { TFunction } from "../i18n"
import type { MetricSeverityLevel } from "../types"
import type { MetricsChartTooltipModel } from "./MetricsChartTooltip"
import {
  formatTooltipPeriodLabel,
  type HeatmapCellMeasure,
} from "./metricsTrackerChart.utils"

export function buildHeatmapCellTooltip(
  t: TFunction,
  args: {
    metricType: MetricType
    periodDate: Date
    granularity: MetricsGranularity
    severity: MetricSeverityLevel | undefined
    measure: HeatmapCellMeasure | null
  }
): MetricsChartTooltipModel {
  const { metricType, periodDate, granularity, severity, measure } = args
  const title = formatTooltipPeriodLabel(periodDate, granularity)
  const indicatorLabel = t(METRIC_TYPE_I18N_KEY[metricType])

  const detailLines: string[] = []
  if (measure && measure.sampleCount > 1) {
    detailLines.push(
      t("metricsChartAvgSample", { count: measure.sampleCount })
    )
  }

  if (!measure && !severity) {
    return {
      title,
      indicatorLabel,
      valueLabel: null,
      statusLabel: null,
      severity: null,
      detailLines: [t("noDataAvailable")],
    }
  }

  return {
    title,
    indicatorLabel,
    valueLabel: measure?.valueLabel ?? null,
    statusLabel: severity ? t(severity) : null,
    severity: severity ?? null,
    detailLines,
  }
}
