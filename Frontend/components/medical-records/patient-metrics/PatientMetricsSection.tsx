"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns"

import {
  BloodCellFilledIcon,
  BloodPressureFilledIcon,
  ChartMetricIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartRateIcon,
  LipidPanelFilledIcon,
  MoleculeFilledIcon,
  TestTubeFilledIcon,
  WaterMineralFilledIcon,
  WeightFilledIcon,
} from "../ysalus-metrics/icons"
import { MetricType, type MetricData } from "../ysalus-metrics/types"
import { mergeHealthMetricData } from "../ysalus-metrics/healthMetricsChart.utils"
import { adaptVitalMetricsToMetricData } from "../ysalus-metrics/adapter"
import { AddMeasurementPopup } from "../add-measurement-popup/AddMeasurementPopup"
import { mapFormValuesToCreateRequest } from "../add-measurement-popup/mapToBackendPayload"
import {
  patientVitalMetricsService,
  type MedicalVitalMetricPoint,
} from "@/services/patient-vital-metrics.service"
import { patientVitalMeasurementService } from "@/services/patient-vital-measurement.service"

import {
  GRANULARITY_VALUES,
  METRICS_PRIMARY_TAB_VALUES,
  METRIC_TYPE_I18N_KEY,
  type MetricsGranularity,
  type MetricsPrimaryTab,
} from "./constants"
import { useTranslation, type TFunction } from "./i18n"
import { MetricsLatestList } from "./MetricsLatestList"
import { MetricsTrackerChart } from "./charts/MetricsTrackerChart"
import { useMetricsLatestGroups } from "./hooks/useMetricsLatestGroups"
import type { PatientMetricsUiState } from "./types"

interface Props {
  patientId: string
  patientName?: string
  patientReadableId?: string
}

function createInitialState(): PatientMetricsUiState {
  const now = new Date()
  return {
    primaryTab: "all",
    granularity: "month",
    highlightedMetricType: null,
    periodAnchor: now,
    selectedCalendarDay: now,
  }
}

function getPeriodRange(granularity: MetricsGranularity, anchorDate: Date) {
  if (granularity === "week") {
    return {
      start: startOfWeek(anchorDate, { weekStartsOn: 1 }),
      end: endOfWeek(anchorDate, { weekStartsOn: 1 }),
    }
  }
  if (granularity === "year") {
    return {
      start: startOfYear(anchorDate),
      end: endOfYear(anchorDate),
    }
  }
  return {
    start: startOfMonth(anchorDate),
    end: endOfMonth(anchorDate),
  }
}

function formatRangeLabel(granularity: MetricsGranularity, anchorDate: Date) {
  const range = getPeriodRange(granularity, anchorDate)
  if (granularity === "year") {
    return `${format(range.start, "MMMM")} - ${format(
      range.end,
      "MMMM, yyyy"
    )}`
  }
  return `${format(range.start, "d")} - ${format(range.end, "d MMMM, yyyy")}`
}

function moveAnchorDate(
  anchorDate: Date,
  granularity: MetricsGranularity,
  direction: -1 | 1
) {
  if (granularity === "week") return addDays(anchorDate, direction * 7)
  if (granularity === "year") return addYears(anchorDate, direction)
  return addMonths(anchorDate, direction)
}

function resolveTabLabel(tab: MetricsPrimaryTab, t: TFunction): string {
  if (tab === "all") return t("all")
  return t(METRIC_TYPE_I18N_KEY[tab])
}

function resolveTabIcon(tab: MetricsPrimaryTab) {
  if (tab === "all") return ChartMetricIcon
  if (tab === MetricType.BloodSugar) return WaterMineralFilledIcon
  if (tab === MetricType.BloodPressure) return BloodPressureFilledIcon
  if (tab === MetricType.HeartRate) return HeartRateIcon
  if (tab === MetricType.Hematocrit) return TestTubeFilledIcon
  if (tab === MetricType.Hemoglobin) return BloodCellFilledIcon
  if (tab === MetricType.Ketone) return MoleculeFilledIcon
  if (tab === MetricType.Cholesterol) return LipidPanelFilledIcon
  if (tab === MetricType.UricAcid) return WeightFilledIcon
  return ChartMetricIcon
}

function MetricsCategoryTabs({
  selectedTab,
  onSelectTab,
}: {
  selectedTab: MetricsPrimaryTab
  onSelectTab: (tab: MetricsPrimaryTab) => void
}) {
  const { t } = useTranslation()

  return (
    <div className="w-full border-b border-gray-100 px-3 pt-3 sm:px-4 sm:pt-4">
      {/*
       * Mobile / narrow: horizontal scroll with a comfortable gap so users
       * can swipe through all categories.
       *
       * lg+ : the row is wide enough to fit every tab, so we drop the
       * scrollbar and switch to `justify-between` — gaps grow automatically
       * to distribute the tabs evenly across the full width. The underline
       * indicator stays tied to each label's natural width.
       */}
      <div className="flex items-center gap-5 overflow-x-auto no-scrollbar lg:justify-between lg:gap-2 lg:overflow-x-visible">
        {METRICS_PRIMARY_TAB_VALUES.map((tab) => {
          const isSelected = selectedTab === tab
          const Icon = resolveTabIcon(tab)

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onSelectTab(tab)}
              className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap pb-3 text-sm font-semibold transition ${
                isSelected
                  ? "text-[#1588A0]"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`size-4 shrink-0 ${
                  isSelected ? "text-[#1588A0]" : "text-gray-400"
                }`}
              />
              <span>{resolveTabLabel(tab, t)}</span>
              {isSelected ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#1588A0]" />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PeriodToolbar({
  anchorDate,
  granularity,
  onMove,
  onSelectGranularity,
}: {
  anchorDate: Date
  granularity: MetricsGranularity
  onMove: (direction: -1 | 1) => void
  onSelectGranularity: (granularity: MetricsGranularity) => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 md:gap-5 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
      <div className="flex w-full items-center justify-center gap-3 text-gray-950 sm:gap-4 lg:w-auto lg:justify-start">
        <button
          type="button"
          onClick={() => onMove(-1)}
          className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-gray-50 lg:size-8"
          aria-label="Previous period"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <span className="min-w-0 flex-1 text-center text-base font-bold leading-snug sm:text-lg lg:flex-none lg:whitespace-nowrap lg:text-xl">
          {formatRangeLabel(granularity, anchorDate)}
        </span>
        <button
          type="button"
          onClick={() => onMove(1)}
          className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-gray-50 lg:size-8"
          aria-label="Next period"
        >
          <ChevronRightIcon className="size-5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start lg:justify-end">
        {GRANULARITY_VALUES.map((value) => {
          const isSelected = granularity === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelectGranularity(value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-bold transition lg:px-6 lg:py-2 lg:text-base ${
                isSelected
                  ? "border-gray-300 bg-[#F8F8F8] text-gray-700 shadow-inner"
                  : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
              }`}
            >
              {t(value)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LoadingPanel() {
  return (
    <div className="flex min-h-[240px] flex-col gap-4 lg:min-h-[330px] lg:gap-5">
      <div className="h-7 animate-pulse rounded bg-gray-100 lg:h-8" />
      <div className="h-[200px] animate-pulse rounded-2xl bg-gray-100 lg:h-[260px]" />
    </div>
  )
}

export function PatientMetricsSection({
  patientId,
  patientName,
  patientReadableId,
}: Props) {
  const { t } = useTranslation()
  const [state, setState] = useState<PatientMetricsUiState>(createInitialState)
  const [points, setPoints] = useState<MedicalVitalMetricPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setState(createInitialState())
  }, [patientId])

  /**
   * Fetch points scoped to the currently-viewed period. The backend supports
   * `?from=&to=` (and `period=` as a shorthand) so we send the calendar-aligned
   * bounds for the anchor + granularity. When the user navigates to a prior
   * month/year, the request is re-issued for that window.
   */
  useEffect(() => {
    if (!patientId) {
      setPoints([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const range = getPeriodRange(state.granularity, state.periodAnchor)
    ;(async () => {
      try {
        const data = await patientVitalMetricsService.getVitalMetrics(
          patientId,
          {
            period: state.granularity,
            from: range.start.toISOString(),
            to: range.end.toISOString(),
          }
        )
        if (!cancelled) setPoints(data)
      } catch (err) {
        console.error("Failed to load vital metrics", err)
        if (!cancelled) setError("Không thể tải chỉ số sức khỏe.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [patientId, refreshKey, state.granularity, state.periodAnchor])

  const rawMetrics = useMemo(
    () => adaptVitalMetricsToMetricData(points, patientId),
    [points, patientId]
  )
  const metrics = useMemo(
    () => mergeHealthMetricData(rawMetrics, []),
    [rawMetrics]
  )

  const activeMetricType =
    state.primaryTab === "all" ? null : state.primaryTab

  const latestGroups = useMetricsLatestGroups(metrics, activeMetricType)

  const handlePrimaryTabChange = useCallback((tab: MetricsPrimaryTab) => {
    setState((current) => ({
      ...current,
      primaryTab: tab,
      highlightedMetricType: null,
    }))
  }, [])

  const handleGranularityChange = useCallback(
    (granularity: MetricsGranularity) => {
      setState((current) => ({ ...current, granularity }))
    },
    []
  )

  const handlePeriodMove = useCallback((direction: -1 | 1) => {
    setState((current) => ({
      ...current,
      periodAnchor: moveAnchorDate(
        current.periodAnchor,
        current.granularity,
        direction
      ),
      selectedCalendarDay: null,
    }))
  }, [])

  const handleDateSelect = useCallback((day: Date) => {
    setState((current) => ({ ...current, selectedCalendarDay: day }))
  }, [])

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 lg:rounded-3xl">
      <MetricsCategoryTabs
        selectedTab={state.primaryTab}
        onSelectTab={handlePrimaryTabChange}
      />

      <div className="flex flex-col gap-5 px-3 py-4 sm:px-4 sm:py-5 lg:gap-8 lg:px-4 lg:py-6">
        <PeriodToolbar
          anchorDate={state.periodAnchor}
          granularity={state.granularity}
          onMove={handlePeriodMove}
          onSelectGranularity={handleGranularityChange}
        />

        {loading && metrics.length === 0 ? (
          <LoadingPanel />
        ) : error ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-2xl bg-rose-50 text-sm text-rose-600 lg:min-h-[330px]">
            {error}
          </div>
        ) : (
          <MetricsTrackerChart
            activeMetricType={activeMetricType}
            anchorDate={state.periodAnchor}
            granularity={state.granularity}
            metrics={metrics}
            selectedDate={state.selectedCalendarDay}
            onSelectDate={handleDateSelect}
          />
        )}

        <MetricsLatestList
          heading={t("latestMeasurements")}
          groups={latestGroups}
          isAggregateView={!activeMetricType}
          isLoading={loading && metrics.length === 0}
          trailingHeader={
            <button
              type="button"
              onClick={() => setIsAddMeasurementOpen(true)}
              className="h-9 rounded-full border border-[#1588A0] bg-white px-4 text-xs font-semibold text-[#1588A0] transition hover:bg-[#E0F2F7] sm:h-10 sm:px-5 sm:text-sm"
            >
              Thêm chỉ số
            </button>
          }
        />
      </div>

      <AddMeasurementPopup
        isOpen={isAddMeasurementOpen}
        onClose={() => setIsAddMeasurementOpen(false)}
        patientId={patientId}
        patientName={patientName}
        readableId={patientReadableId}
        onSave={async ({ result, formValues }) => {
          const payload = mapFormValuesToCreateRequest(formValues, result)
          if (!payload) {
            throw new Error("Loại chỉ số chưa được hỗ trợ.")
          }
          await patientVitalMeasurementService.create(payload)
          setRefreshKey((k) => k + 1)
        }}
      />
    </section>
  )
}
