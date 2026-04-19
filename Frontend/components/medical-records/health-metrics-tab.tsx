"use client"

/**
 * Ported 1:1 from ysalus-source/ysalus-web/src/features/report/components/tabs/HealthMetricsTab.tsx
 *
 * Differences from ysalus (intentional):
 * - No socket / realtime merge (not wired yet in HealthCare).
 * - No NewMeasurementPopup / add-measurement flow (patient-side is read only).
 * - No toast — not needed here.
 * - i18n replaced with inline Vietnamese strings.
 * - The data source is our own MedicalVitalMetricPoint[] which we adapt to
 *   the ysalus MetricData[] shape before plugging into the ported helpers.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { format, isToday, startOfDay } from "date-fns"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
} from "./ysalus-metrics/icons"

import { cn } from "@/lib/utils"
import {
  patientVitalMetricsService,
  type MedicalVitalMetricPoint,
} from "@/services/patient-vital-metrics.service"
import { patientVitalMeasurementService } from "@/services/patient-vital-measurement.service"

import { AddMeasurementPopup } from "./add-measurement-popup/AddMeasurementPopup"
import { mapFormValuesToCreateRequest } from "./add-measurement-popup/mapToBackendPayload"
import { HealthMetricsChartContainer } from "./ysalus-metrics/HealthMetricsChartContainer"
import { MeasurementDateItem } from "./ysalus-metrics/MeasurementDateItem"
import { MetricsFilterMenu } from "./ysalus-metrics/MetricsFilterMenu"
import { DateRangeSelect } from "./ysalus-metrics/DateRangeSelect"
import { adaptVitalMetricsToMetricData } from "./ysalus-metrics/adapter"
import {
  type ClientMetricFilterKey,
  isClientMetricFilterKey,
} from "./ysalus-metrics/healthMetricsFilter.constants"
import {
  buildHealthMetricOptions,
  getHealthMetricTimelineDate,
  getHealthMetricColor,
  mergeHealthMetricData,
  resolveHealthMetricChartKeys,
  type HealthMetricChartKey,
  type HealthMetricDateRange,
  type HealthMetricOptionKey,
} from "./ysalus-metrics/healthMetricsChart.utils"
import { MetricType, type MetricDetail, type SelectOption } from "./ysalus-metrics/types"

const dateRangeOptions: SelectOption[] = [
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
]

interface Props {
  patientId?: string
  patientName?: string
  patientReadableId?: string
  showLatestMeasurementsSection?: boolean
}

export function HealthMetricsTab({
  patientId,
  patientName,
  patientReadableId,
  showLatestMeasurementsSection = true,
}: Props) {
  const [points, setPoints] = useState<MedicalVitalMetricPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedFilters, setSelectedFilters] = useState<SelectOption[]>([])
  const [selectedMetricOptionKey, setSelectedMetricOptionKey] =
    useState<HealthMetricOptionKey | null>(null)
  const [selectedDateRange, setSelectedDateRange] =
    useState<HealthMetricDateRange>("week")
  const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false)

  const fetchData = useCallback(
    async (signal?: { cancelled: boolean }) => {
      if (!patientId) return
      setLoading(true)
      setError(null)
      try {
        const data = await patientVitalMetricsService.getVitalMetrics(patientId)
        if (!signal?.cancelled) setPoints(data)
      } catch (err) {
        console.error("Failed to load vital metrics", err)
        if (!signal?.cancelled) {
          setError("Không thể tải chỉ số sức khỏe. Vui lòng thử lại sau.")
        }
      } finally {
        if (!signal?.cancelled) setLoading(false)
      }
    },
    [patientId],
  )

  useEffect(() => {
    const signal = { cancelled: false }
    fetchData(signal)
    return () => {
      signal.cancelled = true
    }
  }, [fetchData])

  const rawMetrics = useMemo(
    () => adaptVitalMetricsToMetricData(points, patientId ?? ""),
    [points, patientId]
  )

  const metrics = useMemo(
    () => mergeHealthMetricData(rawMetrics, []),
    [rawMetrics]
  )

  const chartMetricOptions = useMemo(
    () => buildHealthMetricOptions(metrics),
    [metrics]
  )

  const filteredChartMetricOptions = useMemo(() => {
    const selectedFilterKeys = selectedFilters
      .map((option) => {
        if (!option.value) return null
        return isClientMetricFilterKey(option.value) ? option.value : null
      })
      .filter((value): value is ClientMetricFilterKey => Boolean(value))

    if (selectedFilters.length && !selectedFilterKeys.length) return []

    if (!selectedFilterKeys.length) return chartMetricOptions

    const selectedFilterKeySet = new Set(selectedFilterKeys)

    return chartMetricOptions.filter((option) => {
      if (!option.value) return false
      if (option.value === "ecg") return false
      return selectedFilterKeySet.has(option.value as ClientMetricFilterKey)
    })
  }, [chartMetricOptions, selectedFilters])

  const availableMetricOptionKeys = useMemo(
    () =>
      filteredChartMetricOptions
        .map((option) => option.value as HealthMetricOptionKey | undefined)
        .filter((value): value is HealthMetricOptionKey => Boolean(value)),
    [filteredChartMetricOptions]
  )

  useEffect(() => {
    if (!availableMetricOptionKeys.length) {
      if (selectedMetricOptionKey !== null) {
        setSelectedMetricOptionKey(null)
      }
      return
    }

    if (
      selectedMetricOptionKey &&
      availableMetricOptionKeys.includes(selectedMetricOptionKey)
    ) {
      return
    }

    setSelectedMetricOptionKey(availableMetricOptionKeys[0])
  }, [availableMetricOptionKeys, selectedMetricOptionKey])

  const selectedMetricKeys = useMemo(
    () => resolveHealthMetricChartKeys(selectedMetricOptionKey),
    [selectedMetricOptionKey]
  )

  /**
   * Group every MetricData bucket by CALENDAR DAY so all measurements taken
   * on the same day render under a single date label ("Hôm nay" / "16 thg 4")
   * — matching the ysalus-source "Latest measurements" layout.
   */
  const measurementsByDay = useMemo(() => {
    const METRIC_ORDER: Record<MetricType, number> = {
      [MetricType.BloodPressure]: 0,
      [MetricType.HeartRate]: 1,
      [MetricType.BloodSugar]: 2,
      [MetricType.Cholesterol]: 3,
      [MetricType.UricAcid]: 4,
      [MetricType.Hemoglobin]: 5,
      [MetricType.Hematocrit]: 6,
      [MetricType.Ketone]: 7,
      [MetricType.Ecg]: 8,
      [MetricType.Measurement]: 9,
    }

    const detailTime = (detail: MetricDetail): number => {
      const ref = detail.takenAt ?? detail.updatedAt ?? detail.createdAt
      return ref ? new Date(ref).getTime() : 0
    }

    const byDay = new Map<
      string,
      { dayStart: Date; details: MetricDetail[] }
    >()

    for (const metricData of metrics) {
      const dayStart = startOfDay(getHealthMetricTimelineDate(metricData))
      const dayKey = dayStart.toISOString()
      const bucket =
        byDay.get(dayKey) ?? { dayStart, details: [] as MetricDetail[] }
      bucket.details.push(...metricData.metricDetails)
      byDay.set(dayKey, bucket)
    }

    return Array.from(byDay.values())
      .map(({ dayStart, details }) => ({
        dayStart,
        details: details.sort((a, b) => {
          const timeDiff = detailTime(b) - detailTime(a)
          if (timeDiff !== 0) return timeDiff
          return (METRIC_ORDER[a.type] ?? 99) - (METRIC_ORDER[b.type] ?? 99)
        }),
      }))
      .sort((left, right) => right.dayStart.getTime() - left.dayStart.getTime())
  }, [metrics])

  const renderMetricOptionChip = (option: SelectOption) => {
    if (!option.value) return null

    const metricOptionKey = option.value as HealthMetricOptionKey
    const isSelected = selectedMetricOptionKey === metricOptionKey
    const selectedColor =
      metricOptionKey === "bp"
        ? getHealthMetricColor("systolicValue")
        : metricOptionKey === "ecg"
          ? getHealthMetricColor("ecg")
          : getHealthMetricColor(metricOptionKey as HealthMetricChartKey)

    return (
      <div
        key={option.value ?? option.label.toString()}
        className={cn(
          "rounded-full truncate border p-2 text-xs cursor-pointer transition-colors",
          isSelected
            ? "text-white border-transparent"
            : "bg-gray-200 text-gray-800 border-gray-200"
        )}
        style={isSelected ? { background: selectedColor } : undefined}
        onClick={() => setSelectedMetricOptionKey(metricOptionKey)}
      >
        {option.label}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        showLatestMeasurementsSection ? "gap-4" : ""
      )}
    >
      {/* CHART CARD */}
      <div className="flex flex-col p-4 bg-white rounded-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center">
            <div className="p-2 cursor-pointer">
              <ChevronLeftIcon className="size-4" />
            </div>
            <span className="font-semibold text-sm">
              {format(new Date(), "MMMM, yyyy")}
            </span>
            <div className="p-2 cursor-pointer">
              <ChevronRightIcon className="size-4" />
            </div>
          </div>
          <div className="hidden lg:flex flex-1 items-center justify-center gap-2 overflow-auto no-scrollbar">
            {filteredChartMetricOptions.map((option) =>
              renderMetricOptionChip(option)
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 text-brand-7">
            <MetricsFilterMenu
              selectedOptions={selectedFilters}
              setSelectedOptions={setSelectedFilters}
            />
            <DateRangeSelect
              options={dateRangeOptions}
              value={selectedDateRange}
              onChange={(option) => {
                if (option.value) {
                  setSelectedDateRange(option.value as HealthMetricDateRange)
                }
              }}
            />
          </div>
        </div>

        <div className="flex lg:hidden mt-4 flex-1 items-center justify-start gap-2 overflow-auto no-scrollbar">
          {filteredChartMetricOptions.map((option) =>
            renderMetricOptionChip(option)
          )}
        </div>

        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="h-[350px] flex items-center justify-center text-sm text-gray-400">
              Đang tải dữ liệu...
            </div>
          ) : error ? (
            <div className="h-[350px] flex items-center justify-center text-sm text-red-500">
              {error}
            </div>
          ) : metrics.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center text-sm text-gray-500">
              Chưa có chỉ số sức khỏe nào trong các lần khám đã hoàn thành.
            </div>
          ) : (
            <HealthMetricsChartContainer
              metricsData={metrics}
              metricKeys={selectedMetricKeys}
              dateRange={selectedDateRange}
            />
          )}
        </div>
      </div>

      {/* LATEST MEASUREMENTS CARD */}
      {showLatestMeasurementsSection ? (
        <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900 font-medium">
              Chỉ số gần nhất
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-10 w-10 rounded-full bg-white border border-brand-5 text-brand-5 flex items-center justify-center hover:bg-brand-05 transition-colors"
                aria-label="Lọc chỉ số"
              >
                <FilterIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddMeasurementOpen(true)}
                className="h-10 px-6 rounded-full bg-white border border-brand-5 text-brand-5 text-sm font-medium hover:bg-brand-05 transition-colors"
              >
                Thêm chỉ số
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {measurementsByDay.length === 0 && !loading ? (
              <p className="text-sm text-gray-500 py-6 text-center">
                Chưa có bản ghi chỉ số nào từ các lần khám đã hoàn thành.
              </p>
            ) : (
              measurementsByDay.map(({ dayStart, details }) => (
                <MeasurementDateItem
                  key={dayStart.toISOString()}
                  metricDetails={details}
                  date={
                    isToday(dayStart)
                      ? "Hôm nay"
                      : format(dayStart, "dd MMM")
                  }
                />
              ))
            )}
          </div>
        </div>
      ) : null}

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
          await fetchData()
        }}
      />
    </div>
  )
}
