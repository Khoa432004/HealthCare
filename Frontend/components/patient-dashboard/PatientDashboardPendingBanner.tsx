"use client"

import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import type {
  PatientDashboardAppointmentItem,
  PatientDashboardMetricCard,
} from "@/services/dashboard.service"
import { Badge } from "@/components/ui/badge"
import { METRIC_TONE_MAP } from "@/components/patient-dashboard/constants"

type Props = {
  pendingAppointment: PatientDashboardAppointmentItem | null
  glucoseMetric?: PatientDashboardMetricCard
}

export function PatientDashboardPendingBanner({
  pendingAppointment,
  glucoseMetric,
}: Props) {
  const router = useRouter()

  if (!pendingAppointment && !glucoseMetric) return null

  return (
    <section className="rounded-xl border border-[#c8dbe2] bg-[#d5e5eb] p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[#0f172a]">Pending Appointment</h3>
        {pendingAppointment ? (
          <button
            type="button"
            onClick={() =>
              router.push(`/patient-calendar/appointment/${pendingAppointment.id}`)
            }
            className="text-[11px] text-[#007A94] inline-flex items-center gap-1 hover:underline"
          >
            See details <ChevronRight className="w-3 h-3" />
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-3">
        {pendingAppointment ? (
          <button
            type="button"
            onClick={() =>
              router.push(`/patient-calendar/appointment/${pendingAppointment.id}`)
            }
            className="rounded-xl border border-[#d1dbe1] bg-white p-4 text-left hover:shadow-sm transition-shadow"
          >
            <p className="text-sm font-semibold text-[#20262b]">
              {pendingAppointment.doctor}
            </p>
            <p className="text-xs text-gray-500 mt-1">{pendingAppointment.time}</p>
            <p className="text-[11px] text-gray-400 mt-2">
              {pendingAppointment.day} · {pendingAppointment.date}
            </p>
          </button>
        ) : (
          <div className="rounded-xl border border-dashed border-[#c3d2d9] bg-white p-4 text-center text-xs text-gray-500">
            No pending appointment
          </div>
        )}

        {glucoseMetric ? (
          <div
            className={`rounded-xl border p-4 bg-white ${
              METRIC_TONE_MAP[glucoseMetric.status] ?? METRIC_TONE_MAP.Normal
            }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium">{glucoseMetric.name}</p>
              <Badge className="bg-white/90 text-[10px] text-gray-700 border-0 h-5">
                {glucoseMetric.status}
              </Badge>
            </div>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-2xl font-semibold leading-none">
                {glucoseMetric.value}
              </span>
              <span className="text-xs opacity-80 mb-0.5">{glucoseMetric.unit}</span>
            </div>
            <p className="mt-1 text-[10px] opacity-80">{glucoseMetric.deltaText}</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
