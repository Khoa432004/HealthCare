"use client"

import type { FC } from "react"
import { format } from "date-fns"

import {
  BloodCellFilledIcon,
  BloodPressureFilledIcon,
  ChartMetricIcon,
  EditIcon,
  ForkKnifeIcon,
  HeartRateIcon,
  LipidPanelFilledIcon,
  MobileIcon,
  MoleculeFilledIcon,
  PdfIcon,
  TestTubeFilledIcon,
  WaterMineralFilledIcon,
  WeightFilledIcon,
} from "../ysalus-metrics/icons"
import { MetricType } from "../ysalus-metrics/types"

import { METRIC_TYPE_I18N_KEY } from "./constants"
import { useTranslation } from "./i18n"
import type {
  LatestMeasurementDateGroup,
  LatestMeasurementRow,
} from "./types"
import {
  KETONE_SEVERITY_STYLE,
  type KetoneSeverity,
} from "./utils/getKetoneSeverity"
import { METRIC_SEVERITY_STYLE } from "./utils/metricSeverity"

interface Props {
  heading: string
  groups: LatestMeasurementDateGroup[]
  isAggregateView?: boolean
  isLoading?: boolean
  onItemClick?: (row: LatestMeasurementRow) => void
  trailingHeader?: React.ReactNode
}

const ICON_MAP: Partial<Record<MetricType, FC<{ className?: string }>>> = {
  [MetricType.BloodSugar]: WaterMineralFilledIcon,
  [MetricType.BloodPressure]: BloodPressureFilledIcon,
  [MetricType.HeartRate]: HeartRateIcon,
  [MetricType.Hematocrit]: TestTubeFilledIcon,
  [MetricType.Ketone]: MoleculeFilledIcon,
  [MetricType.Cholesterol]: LipidPanelFilledIcon,
  [MetricType.UricAcid]: WeightFilledIcon,
  [MetricType.Hemoglobin]: BloodCellFilledIcon,
  [MetricType.Ecg]: ChartMetricIcon,
}

function MetricTime({ row }: { row: LatestMeasurementRow }) {
  if (row.metricType === MetricType.Ecg) {
    return (
      <div className="flex flex-col items-start gap-2 text-gray-400 sm:items-end">
        <PdfIcon className="size-4 shrink-0" />
        <span className="flex items-center gap-1 text-xs">
          <EditIcon className="size-3.5 shrink-0" />
          {row.time}
        </span>
      </div>
    )
  }

  return (
    <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
      <MobileIcon className="size-3.5 shrink-0" />
      {row.time}
    </span>
  )
}

function MetricBadges({ row }: { row: LatestMeasurementRow }) {
  return (
    <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
      {row.tag ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#DDF5FA] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2392A8]">
          <ForkKnifeIcon className="size-3.5" />
          {row.tag}
        </span>
      ) : null}

      {row.severityTag ? (
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
            KETONE_SEVERITY_STYLE[row.severityTag as KetoneSeverity]?.bg ??
            "bg-gray-100"
          } ${
            KETONE_SEVERITY_STYLE[row.severityTag as KetoneSeverity]?.text ??
            "text-gray-500"
          }`}
        >
          {row.severityTag}
        </span>
      ) : null}
    </div>
  )
}

function LatestMeasurementCard({
  row,
  isWide,
  onClick,
}: {
  row: LatestMeasurementRow
  isWide: boolean
  onClick?: (row: LatestMeasurementRow) => void
}) {
  const { t } = useTranslation()
  const Icon = ICON_MAP[row.metricType] ?? WeightFilledIcon
  const severityStyle = row.severityLevel
    ? METRIC_SEVERITY_STYLE[row.severityLevel]
    : METRIC_SEVERITY_STYLE.normal

  return (
    <button
      type="button"
      onClick={() => onClick?.(row)}
      className={`relative flex w-full min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-[#CDEFF5] bg-white p-3 text-left transition hover:border-[#99DDE8] hover:shadow-md lg:min-h-[82px] lg:flex-row lg:items-center lg:gap-4 lg:px-5 lg:py-4 ${
        isWide ? "md:col-span-2" : ""
      }`}
    >
      <span
        className={`absolute inset-y-0 left-0 w-1.5 ${severityStyle.bgClassName}`}
      />

      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#D4F1F6] bg-[#F7FDFF] lg:size-12">
          <Icon className="size-5 text-[#1AA6C0] lg:size-6" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-gray-700 lg:text-base">
            {t(METRIC_TYPE_I18N_KEY[row.metricType])}
          </span>
          <span className="mt-1 flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
            <span className="break-words text-lg font-bold leading-tight text-gray-950 lg:text-xl lg:leading-none">
              {row.valueLabel}
            </span>
            {row.unit ? (
              <span className="text-sm font-medium text-gray-500 lg:text-base">
                {row.unit}
              </span>
            ) : null}
          </span>
        </span>
      </div>

      <span className="flex w-full min-w-0 flex-col gap-2 border-t border-gray-100/80 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-2 sm:gap-y-2 lg:ml-auto lg:w-auto lg:flex-col lg:items-end lg:gap-3 lg:border-t-0 lg:pt-0">
        <MetricBadges row={row} />
        <MetricTime row={row} />
      </span>
    </button>
  )
}

function SkeletonList() {
  return (
    <section className="flex min-h-0 flex-col gap-6 bg-white px-1 py-1 sm:px-2">
      <div className="h-5 w-44 max-w-full animate-pulse rounded bg-gray-100" />
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4"
        >
          <div className="h-10 w-10 shrink-0 animate-pulse rounded bg-gray-100 sm:h-12 sm:w-12" />
          <div className="h-24 min-w-0 flex-1 animate-pulse rounded-xl bg-gray-100" />
        </div>
      ))}
    </section>
  )
}

export function MetricsLatestList({
  heading,
  groups,
  isAggregateView = false,
  isLoading,
  onItemClick,
  trailingHeader,
}: Props) {
  const { t } = useTranslation()

  if (isLoading) return <SkeletonList />

  if (groups.length === 0) {
    return (
      <section className="flex min-h-0 flex-col gap-4 bg-white px-1 py-1 sm:px-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-gray-950">{heading}</h2>
          {trailingHeader}
        </div>
        <div className="rounded-xl border border-dashed border-[#CDEFF5] py-10 text-center text-sm text-gray-400">
          {t("noDataAvailable")}
        </div>
      </section>
    )
  }

  return (
    <section className="flex min-h-0 flex-col gap-4 bg-white px-1 py-1 sm:px-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-gray-950">{heading}</h2>
        {trailingHeader}
      </div>

      <div className="max-h-[min(70vh,520px)] min-w-0 overflow-y-auto overflow-x-hidden pr-1 sm:pr-2 lg:max-h-[520px]">
        <div className="flex flex-col gap-6 pb-3 sm:gap-8 lg:gap-12">
          {groups.map((group) => {
            const dayNumber = format(group.date, "dd")
            const monthLabel = format(group.date, "MMM")

            return (
              <div
                key={`${group.dateLabel}-${group.date.getTime()}`}
                className="flex min-w-0 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,70px)_minmax(0,1fr)] lg:gap-6"
              >
                <div className="flex items-baseline gap-1.5 border-b border-[#CDEFF5]/50 pb-2 text-gray-600 sm:gap-2 lg:block lg:border-0 lg:pb-0 lg:pt-1">
                  <div className="text-lg font-semibold leading-tight sm:text-xl">
                    {dayNumber}
                  </div>
                  <div className="text-lg font-semibold leading-tight sm:text-xl">
                    {monthLabel}
                  </div>
                </div>

                <div
                  className={`grid min-w-0 grid-cols-1 gap-3 sm:gap-4 lg:gap-5 ${
                    isAggregateView ? "md:grid-cols-2" : ""
                  }`}
                >
                  {group.items.map((row, index) => {
                    const isLastOddAggregateItem =
                      isAggregateView &&
                      group.items.length % 2 === 1 &&
                      index === group.items.length - 1

                    return (
                      <LatestMeasurementCard
                        key={row.id}
                        row={row}
                        isWide={isLastOddAggregateItem}
                        onClick={onItemClick}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
