import { format } from "date-fns"

import { MetricType } from "../../ysalus-metrics/types"

import { METRIC_TYPE_I18N_KEY, type MetricsGranularity } from "../constants"
import type { TFunction } from "../i18n"
import type { ChartPoint, RawChartPoint } from "./metricsTrackerChart.utils"
import type { MetricsChartTooltipModel } from "./MetricsChartTooltip"
import {
  formatChartValueDisplay,
  formatTooltipPeriodLabel,
  getDefaultMetricUnit,
} from "./metricsTrackerChart.utils"

export function buildLineChartPointTooltip(
  t: TFunction,
  args: {
    metricType: MetricType
    seriesId: string
    point: ChartPoint
    periodDate: Date
    granularity: MetricsGranularity
  }
): MetricsChartTooltipModel {
  const { metricType, seriesId, point, periodDate, granularity } = args
  const title = formatTooltipPeriodLabel(periodDate, granularity)
  const unit = getDefaultMetricUnit(metricType)
  const valueLine = unit
    ? `${formatChartValueDisplay(point.value)} ${unit}`
    : formatChartValueDisplay(point.value)

  const metricName = t(METRIC_TYPE_I18N_KEY[metricType])
  let indicatorLabel = metricName

  if (metricType === MetricType.BloodPressure) {
    const sub =
      seriesId === "systolic"
        ? t("systolic")
        : seriesId === "diastolic"
          ? t("diastolic")
          : seriesId
    indicatorLabel = `${metricName} · ${sub}`
  }

  const detailLines: string[] = []
  if (point.sampleCount > 1) {
    detailLines.push(t("metricsChartAvgSample", { count: point.sampleCount }))
  }

  return {
    title,
    indicatorLabel,
    valueLabel: valueLine,
    statusLabel: t(point.severity),
    severity: point.severity,
    detailLines,
  }
}

/**
 * Tooltip for an individual measurement dot (raw point). The bucket label is
 * still the period header, but we add a precise time-of-day line so users can
 * tell apart multiple readings stacked in the same day slot.
 */
export function buildLineChartRawPointTooltip(
  t: TFunction,
  args: {
    metricType: MetricType
    seriesId: string
    rawPoint: RawChartPoint
    periodDate: Date
    granularity: MetricsGranularity
  }
): MetricsChartTooltipModel {
  const { metricType, seriesId, rawPoint, periodDate, granularity } = args
  const title = formatTooltipPeriodLabel(periodDate, granularity)
  const unit = getDefaultMetricUnit(metricType)
  const valueLine = unit
    ? `${formatChartValueDisplay(rawPoint.value)} ${unit}`
    : formatChartValueDisplay(rawPoint.value)

  const metricName = t(METRIC_TYPE_I18N_KEY[metricType])
  let indicatorLabel = metricName

  if (metricType === MetricType.BloodPressure) {
    const sub =
      seriesId === "systolic"
        ? t("systolic")
        : seriesId === "diastolic"
          ? t("diastolic")
          : seriesId
    indicatorLabel = `${metricName} · ${sub}`
  }

  // Year buckets are a whole month wide → show "15 Mar HH:mm" so the dot's
  // day-of-month meaning is explicit. Week / month buckets are 1 day → just
  // show the time.
  const timeLabel =
    granularity === "year"
      ? format(rawPoint.date, "d MMM · HH:mm")
      : format(rawPoint.date, "HH:mm")

  const detailLines: string[] = []
  // Surface the meal context (Trước ăn / Sau ăn) for BG dots so users can
  // tell apart same-day measurements taken in different contexts. Skip when
  // there's no context info (general / fasting → "Bình thường" = severity).
  if (rawPoint.contextLabel) {
    detailLines.push(`${timeLabel} · ${rawPoint.contextLabel}`)
  } else {
    detailLines.push(timeLabel)
  }

  return {
    title,
    indicatorLabel,
    valueLabel: valueLine,
    statusLabel: t(rawPoint.severity),
    severity: rawPoint.severity,
    detailLines,
  }
}
