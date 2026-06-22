"use client"

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { useMemo } from "react"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../ysalus-metrics/icons"
import type { MetricData } from "../ysalus-metrics/types"

import { useTranslation } from "./i18n"

interface Props {
  month: Date
  selectedDay: Date | null
  metrics: MetricData[]
  onSelectDay: (day: Date) => void
  /** When set, shows prev/next month controls and calls this with the new month. */
  onMonthChange?: (month: Date) => void
  /** `card`: full section chrome; `popover`: compact desktop dropdown; `sheet`: mobile/tablet modal body. */
  variant?: "card" | "popover" | "sheet"
}

function buildDayKey(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export function MetricsMonthCalendar({
  month,
  selectedDay,
  metrics,
  onSelectDay,
  onMonthChange,
  variant = "card",
}: Props) {
  const { t } = useTranslation()
  const isPopover = variant === "popover"
  const isSheet = variant === "sheet"

  const days = useMemo(() => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)

    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
    })
  }, [month])

  const dayCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const metric of metrics) {
      for (const detail of metric.metricDetails ?? []) {
        const day = new Date(
          detail.takenAt ?? detail.updatedAt ?? detail.createdAt
        )
        const key = buildDayKey(day)
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
    return counts
  }, [metrics])

  const monthTitle = format(month, "MMMM yyyy")
  const shellClassName = isPopover
    ? "flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-gray-100 shadow-md"
    : "flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-md ring-1 ring-gray-100"
  const dayGridClassName = isPopover
    ? "grid grid-cols-7 gap-2"
    : "grid grid-cols-7 gap-1 sm:gap-2"
  const dayButtonClassName = isPopover
    ? "relative flex h-16 w-16 flex-col items-center justify-between rounded-2xl border px-2 py-2 text-center transition"
    : "relative flex aspect-square w-full min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-1 text-center transition sm:rounded-2xl sm:px-2 sm:py-2"
  const dayTextClassName = isPopover
    ? "text-sm font-semibold"
    : "text-xs font-semibold sm:text-sm"
  const dotClassName = isPopover
    ? "h-2 w-2 rounded-full"
    : "h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"
  const navButtonClassName = `flex ${
    isSheet ? "size-9" : "size-8"
  } shrink-0 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50`
  const monthTitleClassName = isSheet
    ? "text-sm font-semibold text-gray-900 sm:text-base"
    : "text-sm font-semibold text-gray-900"

  return (
    <section className={shellClassName}>
      {onMonthChange ? (
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, -1))}
            className={navButtonClassName}
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="size-5" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <h3 className={monthTitleClassName}>{monthTitle}</h3>
            <p className="text-xs text-gray-400">{t("latestMeasurements")}</p>
          </div>

          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, 1))}
            className={navButtonClassName}
            aria-label="Next month"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-gray-900">{monthTitle}</h3>
            <p className="text-xs text-gray-400">{t("latestMeasurements")}</p>
          </div>
          <span className="rounded-full bg-[#E0F2F7] px-3 py-1 text-xs font-medium text-[#007A94]">
            {t("today")}
          </span>
        </div>
      )}

      <div className={dayGridClassName}>
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dayName) => (
          <div
            key={dayName}
            className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 sm:text-[11px]"
          >
            {dayName}
          </div>
        ))}

        {days.map((day) => {
          const key = buildDayKey(day)
          const count = dayCounts.get(key) ?? 0
          const isSelected = selectedDay
            ? isSameDay(day, selectedDay)
            : isToday(day)

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(day)}
              aria-label={format(day, "EEEE, d MMMM yyyy")}
              className={`${dayButtonClassName} ${
                isSameMonth(day, month)
                  ? "border-gray-200 bg-white hover:border-[#7CCEDD] hover:bg-[#E0F2F7]"
                  : "border-transparent bg-gray-50 text-gray-300"
              } ${
                isSelected
                  ? "border-[#007A94] bg-[#E0F2F7] shadow-sm"
                  : ""
              }`}
            >
              <span
                className={`${dayTextClassName} ${
                  isSameMonth(day, month) ? "text-gray-900" : "text-gray-300"
                }`}
              >
                {format(day, "d")}
              </span>

              <span
                className={`${dotClassName} ${
                  count > 0
                    ? isSelected
                      ? "bg-white"
                      : "bg-[#007A94]"
                    : "bg-transparent"
                }`}
              />
            </button>
          )
        })}
      </div>
    </section>
  )
}
