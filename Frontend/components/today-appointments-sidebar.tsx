"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { Appointment } from "@/services/appointment.service"

interface TodayAppointmentsSidebarProps {
  appointmentsData?: Appointment[]
}

export default function TodayAppointmentsSidebar({ appointmentsData }: TodayAppointmentsSidebarProps) {
  const router = useRouter()
  const [now, setNow] = useState(new Date())
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const day = now
  const startHour = 0
  const endHour = 24
  const hourHeight = 144

  const slots = Array.from({ length: endHour - startHour }).map((_, index) => startHour + index)
  const totalMinutes = (endHour - startHour) * 60
  const minCardHeightPx = 34

  const normalizedAppointments = useMemo(() => {
    const rawEvents = (appointmentsData || [])
      .slice()
      .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
      .map((item) => {
        const start = new Date(item.scheduledStart)
        const end = new Date(item.scheduledEnd)
        const startsAt = start.getHours() * 60 + start.getMinutes()
        const endsAt = end.getHours() * 60 + end.getMinutes()
        const dayStart = startHour * 60
        const dayEnd = endHour * 60
        const topMinutes = Math.max(0, startsAt - dayStart)
        const clampedStart = Math.max(dayStart, startsAt)
        const clampedEnd = Math.min(dayEnd, endsAt)
        const actualDurationMinutes = Math.max(1, clampedEnd - clampedStart)
        const topPx = (topMinutes / 60) * hourHeight
        const heightPx = Math.max((actualDurationMinutes / 60) * hourHeight, minCardHeightPx)

        return {
          id: item.id,
          title: item.title || item.patientFullName || item.patientName || "Appointment",
          subtitle: `${start.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })} - ${end.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          topPx,
          heightPx,
          startMin: clampedStart,
          endMin: Math.max(clampedStart + 1, clampedEnd),
          status: String(item.status || "").toUpperCase(),
        }
      })
      .filter((event) => event.topPx < (totalMinutes / 60) * hourHeight && event.heightPx > 0)

    // Arrange overlapping events into columns so cards never stack on top of each other.
    type ActiveEvent = { endMin: number; col: number; clusterId: number }
    const active: ActiveEvent[] = []
    let nextClusterId = 0
    const clusterMaxCols: Record<number, number> = {}
    const enriched = rawEvents.map((event) => ({ ...event, clusterId: -1, col: 0 }))

    for (const event of enriched) {
      for (let i = active.length - 1; i >= 0; i -= 1) {
        if (active[i].endMin <= event.startMin) {
          active.splice(i, 1)
        }
      }

      let clusterId: number
      if (active.length === 0) {
        clusterId = nextClusterId
        nextClusterId += 1
      } else {
        clusterId = active[0].clusterId
      }

      const usedCols = new Set(active.map((a) => a.col))
      let col = 0
      while (usedCols.has(col)) col += 1

      event.clusterId = clusterId
      event.col = col
      active.push({ endMin: event.endMin, col, clusterId })
      clusterMaxCols[clusterId] = Math.max(clusterMaxCols[clusterId] || 0, col + 1, active.length)
    }

    const laidOut = enriched.map((event) => ({
      ...event,
      totalCols: Math.max(1, clusterMaxCols[event.clusterId] || 1),
    }))

    // Final guard: in each visual column, ensure cards never overlap after applying minimum card height.
    const byColumnKey = new Map<string, typeof laidOut>()
    laidOut.forEach((event) => {
      const key = `${event.clusterId}-${event.col}`
      const bucket = byColumnKey.get(key) || []
      bucket.push(event)
      byColumnKey.set(key, bucket)
    })

    byColumnKey.forEach((eventsInColumn) => {
      eventsInColumn.sort((a, b) => a.topPx - b.topPx)
      for (let i = 1; i < eventsInColumn.length; i += 1) {
        const prev = eventsInColumn[i - 1]
        const curr = eventsInColumn[i]
        const minTop = prev.topPx + prev.heightPx + 2
        if (curr.topPx < minTop) {
          curr.topPx = minTop
        }
      }
    })

    return laidOut
  }, [appointmentsData, endHour, hourHeight, startHour, totalMinutes])

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 60_000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const minutesNow = now.getHours() * 60 + now.getMinutes()
    const nowPosition = (minutesNow / 60) * hourHeight
    const targetTop = Math.max(0, nowPosition - container.clientHeight / 2)
    container.scrollTo({ top: targetTop, behavior: "smooth" })
  }, [hourHeight, now])

  const getEventClassName = (status: string) => {
    if (status === "CANCELED" || status === "CANCEL") {
      return "border-[#ef4444] bg-[#fef2f2] text-[#b91c1c]"
    }
    if (status === "COMPLETED") {
      return "border-[#16a34a] bg-[#f0fdf4] text-[#166534]"
    }
    if (status === "IN_PROCESS") {
      return "border-[#f59e0b] bg-[#fffbeb] text-[#b45309]"
    }
    return "border-[#16a1bd] bg-[#eef8fb] text-[#0f6f84]"
  }

  return (
    <div className="bg-white rounded-2xl h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-[#d6e5ea] bg-white">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-600">
          {day.toLocaleDateString("en-US", { weekday: "long" })}
        </span>
        <h3 className="text-base font-semibold text-gray-900 mt-0.5">
          Today Appointments ({normalizedAppointments.length})
        </h3>
      </div>

      <div ref={scrollContainerRef} className="h-[calc(100%-76px)] overflow-y-auto">
        <div className="relative bg-white">
          {slots.map((hour) => (
            <div key={hour} className="flex border-b border-[#d6e5ea]" style={{ height: `${hourHeight}px` }}>
              <div className="w-14 flex-shrink-0 border-r border-[#d6e5ea] px-1.5 pt-1 text-xs text-gray-700">
                {String(hour).padStart(2, "0")}:00
              </div>
              <div className="flex-1" />
            </div>
          ))}

          <div className="absolute inset-y-0 left-14 right-0">
            {normalizedAppointments.map((appointment) => (
              <button
                key={appointment.id}
                type="button"
                onClick={() => router.push(`/calendar/appointment/${appointment.id}`)}
                className={`absolute left-2 right-2 rounded-xl border border-l-4 px-3 py-2 overflow-hidden shadow-md text-left transition hover:shadow-lg hover:brightness-[0.98] ${getEventClassName(appointment.status)}`}
                style={{
                  top: `${appointment.topPx}px`,
                  height: `${appointment.heightPx}px`,
                  left:
                    appointment.totalCols > 1
                      ? `calc(${(100 / appointment.totalCols) * appointment.col}% + 4px)`
                      : "8px",
                  width:
                    appointment.totalCols > 1
                      ? `calc(${100 / appointment.totalCols}% - 8px)`
                      : "calc(100% - 16px)",
                  right: "auto",
                }}
              >
                <div className="text-[15px] leading-5 font-semibold truncate">{appointment.title}</div>
                <div className="text-[13px] leading-5 opacity-85">{appointment.subtitle}</div>
              </button>
            ))}
            {normalizedAppointments.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                No appointments today
              </div>
            )}

            <div
              className="absolute left-0 right-0 border-t border-red-400 z-10"
              style={{
                top: `${((now.getHours() * 60 + now.getMinutes()) / 60) * hourHeight}px`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
