"use client"

import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import type { TimeSlot, WorkSchedule } from "./types"
import { formatSelectedDate, getCalendarGrid, getMonthLabel } from "./utils"

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

type Props = {
  workSchedule: WorkSchedule | null
  monthOffset: number
  onMonthOffsetChange: (offset: number) => void
  selectedDate: string
  onSelectDate: (date: string) => void
  availableSlots: TimeSlot[]
  isLoadingSlots: boolean
  selectedSlot: TimeSlot | null
  onSelectSlot: (slot: TimeSlot) => void
}

export function BookingDateTimePicker({
  workSchedule,
  monthOffset,
  onMonthOffsetChange,
  selectedDate,
  onSelectDate,
  availableSlots,
  isLoadingSlots,
  selectedSlot,
  onSelectSlot,
}: Props) {
  const calendarCells = getCalendarGrid(monthOffset, workSchedule)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Calendar */}
      <div className="rounded-xl border border-[#d6edf2] bg-[#f8fcfd] p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-[#007A94] uppercase tracking-wide">Date</p>
            <p className="text-base font-semibold text-gray-900 capitalize">
              {getMonthLabel(monthOffset)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-[#cce7ee] bg-white"
              onClick={() => onMonthOffsetChange(monthOffset - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-[#cce7ee] bg-white"
              onClick={() => onMonthOffsetChange(monthOffset + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-[11px] font-semibold text-gray-400 py-1"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, index) =>
            cell.type === "empty" ? (
              <div key={`empty-${index}`} className="aspect-square" />
            ) : (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => cell.enabled && onSelectDate(cell.dateStr)}
                disabled={!cell.enabled}
                className={[
                  "aspect-square rounded-lg text-sm font-medium transition-all",
                  selectedDate === cell.dateStr
                    ? "bg-[#007A94] text-white shadow-sm scale-[1.02]"
                    : cell.enabled
                      ? "bg-white text-gray-800 border border-[#e2eef2] hover:border-[#007A94] hover:bg-[#eef8fa]"
                      : "bg-transparent text-gray-300 cursor-not-allowed",
                  cell.isToday && selectedDate !== cell.dateStr && cell.enabled
                    ? "ring-2 ring-[#007A94]/40 ring-offset-1"
                    : "",
                ].join(" ")}
              >
                {cell.date.getDate()}
              </button>
            )
          )}
        </div>
      </div>

      {/* Time slots */}
      <div className="rounded-xl border border-[#d6edf2] bg-[#f8fcfd] p-4 flex flex-col min-h-[280px]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-medium text-[#007A94] uppercase tracking-wide">
              Available time
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {selectedDate ? formatSelectedDate(selectedDate) : "Select a date first"}
            </p>
          </div>
          {selectedSlot ? (
            <div className="flex items-center gap-1.5 rounded-full bg-[#007A94]/10 px-3 py-1 text-xs font-semibold text-[#007A94]">
              <Clock className="w-3.5 h-3.5" />
              {selectedSlot.displayTime}
            </div>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {!selectedDate ? (
            <div className="h-full min-h-[180px] flex items-center justify-center text-sm text-gray-400 text-center px-4">
              Choose an available date on the calendar to see time slots.
            </div>
          ) : isLoadingSlots ? (
            <div className="h-full min-h-[180px] flex items-center justify-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="h-full min-h-[180px] flex items-center justify-center text-sm text-gray-400 text-center px-4">
              No available slots on this date. Please pick another day.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot?.startTime === slot.startTime
                return (
                  <button
                    key={`${slot.startTime}-${slot.displayTime}`}
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    className={[
                      "py-2 px-2 rounded-lg text-sm font-medium transition-all",
                      isSelected
                        ? "bg-[#007A94] text-white shadow-sm"
                        : "bg-white text-[#007A94] border border-[#cce7ee] hover:bg-[#eef8fa] hover:border-[#007A94]/50",
                    ].join(" ")}
                  >
                    {slot.displayTime}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
