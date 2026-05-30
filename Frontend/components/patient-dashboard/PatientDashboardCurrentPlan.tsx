import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ChevronRight, ClipboardList, Phone } from "lucide-react"
import type { PatientDashboardCurrentPlan } from "@/services/dashboard.service"
import { Badge } from "@/components/ui/badge"

type Props = {
  currentPlan?: PatientDashboardCurrentPlan | null
}

function formatPlanDate(value?: string) {
  if (!value) return "—"
  try {
    return format(parseISO(value), "dd/MM/yyyy")
  } catch {
    return value
  }
}

function calcDurationDays(start?: string, end?: string) {
  if (!start || !end) return "—"
  try {
    const startDate = parseISO(start)
    const endDate = parseISO(end)
    const days = Math.max(
      0,
      Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    )
    return `${days} days`
  } catch {
    return "—"
  }
}

export function PatientDashboardCurrentPlan({ currentPlan }: Props) {
  const hasPlan = Boolean(currentPlan?.title)

  return (
    <section className="rounded-xl border border-[#c8dbe2] bg-[#d5e5eb] p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[#0f172a]">Current Plan</h3>
        <Link
          href="/patient-purchased-packages"
          className="text-[11px] text-[#007A94] inline-flex items-center gap-1 hover:underline"
        >
          See details <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#d6edf2] p-4">
        {hasPlan ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-lg bg-[#e9f7fb] flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-[#007A94]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0f172a] truncate">
                    {currentPlan?.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px]">
                      {currentPlan?.status ?? "Active"}
                    </Badge>
                    {currentPlan?.daysLeft ? (
                      <span className="text-xs text-gray-500">
                        {currentPlan.daysLeft} days left
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-lg border border-[#d6edf2] bg-[#f8fcfd] px-3 py-2 shrink-0">
                <Phone className="w-4 h-4 text-[#007A94]" />
                <div>
                  <p className="text-[10px] text-gray-500">Call (From Doctor)</p>
                  <p className="text-xs font-semibold text-[#0f172a]">Available</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-gray-500">Start date</p>
                <p className="font-medium text-[#0f172a] mt-0.5">
                  {formatPlanDate(currentPlan?.startDate)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">End date</p>
                <p className="font-medium text-[#0f172a] mt-0.5">
                  {formatPlanDate(currentPlan?.endDate)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Duration</p>
                <p className="font-medium text-[#0f172a] mt-0.5">
                  {calcDurationDays(currentPlan?.startDate, currentPlan?.endDate)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Appointments</p>
                <p className="font-medium text-[#0f172a] mt-0.5">
                  {currentPlan?.appointmentSummary ?? "—"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5">
                <span>Progress</span>
                <span>{currentPlan?.progressPercent ?? 0}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#dff2f7]">
                <div
                  className="h-full rounded-full bg-[#007A94] transition-all"
                  style={{ width: `${currentPlan?.progressPercent ?? 0}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-xs text-gray-500">
            No active package plan
          </div>
        )}
      </div>
    </section>
  )
}
