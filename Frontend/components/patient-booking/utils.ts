import type { DoctorDetail, DoctorSummary, WorkSchedule, BookingFormat } from "./types"
import { resolveAppointmentFormatFromTitle as resolveFromTitle } from "@/lib/appointment-format"

export function getInitials(name: string): string {
  if (!name) return "PT"
  const parts = name.trim().split(" ")
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export function formatCurrency(amount?: number): string {
  return new Intl.NumberFormat("vi-VN").format(Number(amount ?? 0))
}

export function resolveAppointmentCost(
  workSchedule?: WorkSchedule | null,
  doctor?: DoctorSummary | DoctorDetail | null
): number {
  if (workSchedule?.appointmentCost) return Number(workSchedule.appointmentCost)
  if (doctor?.appointmentCost) return Number(doctor.appointmentCost)
  if (doctor?.cost) {
    const numeric = String(doctor.cost).replace(/[^0-9]/g, "")
    const value = Number(numeric || 0)
    if (value > 0) return value
  }
  return 0
}

export function getMonthDates(
  monthOffset: number,
  workSchedule?: WorkSchedule | null
): Array<{ date: Date; dateStr: string; weekday: number; enabled: boolean; isPast: boolean }> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const year = today.getFullYear()
  const month = today.getMonth() + monthOffset
  const lastDay = new Date(year, month + 1, 0).getDate()
  const dates: Array<{ date: Date; dateStr: string; weekday: number; enabled: boolean; isPast: boolean }> = []

  for (let d = 1; d <= lastDay; d++) {
    const dt = new Date(year, month, d)
    dt.setHours(0, 0, 0, 0)
    const yyyy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, "0")
    const dd = String(dt.getDate()).padStart(2, "0")
    const dateStr = `${yyyy}-${mm}-${dd}`
    const jsDay = dt.getDay()
    const backendWeekday = jsDay === 0 ? 7 : jsDay
    const hasSchedule = !!workSchedule?.days?.some(
      (day) => Number(day.weekday) === backendWeekday && day.enabled
    )
    const isPast = dt < today
    dates.push({
      date: dt,
      dateStr,
      weekday: backendWeekday,
      enabled: hasSchedule && !isPast,
      isPast,
    })
  }

  return dates
}

export function getMonthLabel(monthOffset: number): string {
  const dt = new Date()
  dt.setMonth(dt.getMonth() + monthOffset)
  const label = dt.toLocaleString("vi-VN", { month: "long", year: "numeric" })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export type CalendarCell =
  | { type: "empty" }
  | {
      type: "day"
      date: Date
      dateStr: string
      enabled: boolean
      isPast: boolean
      isToday: boolean
    }

export function getCalendarGrid(
  monthOffset: number,
  workSchedule?: WorkSchedule | null
): CalendarCell[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const year = today.getFullYear()
  const month = today.getMonth() + monthOffset
  const firstDay = new Date(year, month, 1)
  const lastDayNum = new Date(year, month + 1, 0).getDate()
  const startPadding = (firstDay.getDay() + 6) % 7

  const cells: CalendarCell[] = Array.from({ length: startPadding }, () => ({ type: "empty" }))

  for (let d = 1; d <= lastDayNum; d++) {
    const dt = new Date(year, month, d)
    dt.setHours(0, 0, 0, 0)
    const yyyy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, "0")
    const dd = String(dt.getDate()).padStart(2, "0")
    const dateStr = `${yyyy}-${mm}-${dd}`
    const jsDay = dt.getDay()
    const backendWeekday = jsDay === 0 ? 7 : jsDay
    const hasSchedule = !!workSchedule?.days?.some(
      (day) => Number(day.weekday) === backendWeekday && day.enabled
    )
    const isPast = dt < today
    const isToday = dt.getTime() === today.getTime()

    cells.push({
      type: "day",
      date: dt,
      dateStr,
      enabled: hasSchedule && !isPast,
      isPast,
      isToday,
    })
  }

  return cells
}

export function formatSelectedDate(dateStr: string): string {
  if (!dateStr) return ""
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function toApiFormatType(format: BookingFormat): string {
  return format === "offline" ? "At Clinic" : "Online"
}

export function getBookingFormatLabel(format: BookingFormat): string {
  return format === "offline" ? "At Clinic" : "Online"
}

export function getBookingFormatDescription(format: BookingFormat): string {
  return format === "offline"
    ? "Visit the doctor at the clinic in person."
    : "Consult with your doctor via video call."
}

export function resolveAppointmentFormatFromTitle(title?: string | null): BookingFormat {
  return resolveFromTitle(title)
}

export function getAppointmentLocationLabel(title?: string | null): string {
  return getBookingFormatLabel(resolveAppointmentFormatFromTitle(title))
}

export function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeStringList(item))
  }
  if (typeof value !== "string" || !value.trim()) return []

  const trimmed = value.trim()
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    const content = trimmed.slice(1, -1)
    if (!content) return []
    return content
      .split(",")
      .map((s) => s.trim().replace(/^"|"$/g, ""))
      .filter(Boolean)
  }

  return trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

export function formatArrayFieldDisplay(value: unknown): string {
  const items = normalizeStringList(value)
  return items.length > 0 ? items.join(", ") : "—"
}
