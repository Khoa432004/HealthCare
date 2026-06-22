"use client"

import { format, startOfMonth } from "date-fns"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import useBreakpoint from "@/hooks/use-breakpoint"
import {
  CalendarIcon,
  ChevronDownIcon,
  CloseIcon,
} from "../ysalus-metrics/icons"
import type { MetricData } from "../ysalus-metrics/types"

import { MetricsMonthCalendar } from "./MetricsMonthCalendar"

type Props = {
  anchorDate: Date
  metrics: MetricData[]
  selectedDay: Date | null
  onSelectDay: (day: Date) => void
}

function DesktopCalendarPopover({
  metrics,
  selectedDay,
  onSelectDay,
  visibleMonth,
  onMonthChange,
}: Pick<Props, "metrics" | "selectedDay" | "onSelectDay"> & {
  visibleMonth: Date
  onMonthChange: (month: Date) => void
}) {
  return (
    <div className="absolute left-1/2 top-full z-50 mt-2 w-[min(calc(100vw-1.5rem),560px)] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 sm:max-w-none lg:w-[min(calc(100vw-2rem),560px)]">
      <MetricsMonthCalendar
        month={visibleMonth}
        selectedDay={selectedDay}
        metrics={metrics}
        onSelectDay={onSelectDay}
        onMonthChange={onMonthChange}
        variant="popover"
      />
    </div>
  )
}

function MobileCalendarSheet({
  metrics,
  selectedDay,
  onSelectDay,
  visibleMonth,
  onMonthChange,
  onClose,
}: Pick<Props, "metrics" | "selectedDay" | "onSelectDay"> & {
  visibleMonth: Date
  onMonthChange: (month: Date) => void
  onClose: () => void
}) {
  if (typeof document === "undefined") return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-gray-950/35 px-3 py-3 backdrop-blur-[2px] sm:px-6 sm:py-6"
      onClick={onClose}
      role="presentation"
    >
      <div className="flex h-full items-end justify-center sm:items-center">
        <div
          className="w-full max-w-[560px]"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Calendar picker"
        >
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close calendar"
              className="flex size-10 items-center justify-center rounded-full border border-white/70 bg-white text-gray-600 shadow-md transition hover:bg-gray-50"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>

          <MetricsMonthCalendar
            month={visibleMonth}
            selectedDay={selectedDay}
            metrics={metrics}
            onSelectDay={(day) => {
              onSelectDay(day)
              onClose()
            }}
            onMonthChange={onMonthChange}
            variant="sheet"
          />
        </div>
      </div>
    </div>,
    document.body
  )
}

export function MetricsPeriodCalendarPicker({
  anchorDate,
  metrics,
  selectedDay,
  onSelectDay,
}: Props) {
  const { isAtLeast } = useBreakpoint()
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(anchorDate)
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const isDesktop = isAtLeast("lg")
  const displayDate = selectedDay ?? anchorDate

  useEffect(() => {
    if (open) setVisibleMonth(startOfMonth(anchorDate))
  }, [open, anchorDate])

  useEffect(() => {
    if (!open || !isDesktop) return

    const onDocMouseDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [open, isDesktop])

  useEffect(() => {
    if (!open || isDesktop) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open, isDesktop])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full shrink-0 items-center justify-between gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 sm:w-auto lg:justify-start lg:px-5 lg:py-2 lg:text-gray-500 lg:font-normal lg:shadow-none"
        aria-label="Open calendar"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <CalendarIcon className="size-5" />
        <span className="whitespace-nowrap lg:hidden">
          {format(displayDate, "d MMM")}
        </span>
        <ChevronDownIcon
          className={`size-4 shrink-0 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        isDesktop ? (
          <DesktopCalendarPopover
            metrics={metrics}
            selectedDay={selectedDay}
            onSelectDay={(day) => {
              onSelectDay(day)
              setOpen(false)
            }}
            visibleMonth={visibleMonth}
            onMonthChange={setVisibleMonth}
          />
        ) : (
          <MobileCalendarSheet
            metrics={metrics}
            selectedDay={selectedDay}
            onSelectDay={onSelectDay}
            visibleMonth={visibleMonth}
            onMonthChange={setVisibleMonth}
            onClose={() => setOpen(false)}
          />
        )
      ) : null}
    </div>
  )
}
