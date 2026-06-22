"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, Clock, Pill } from "lucide-react"
import type { PatientDashboardMedicineItem } from "@/services/dashboard.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Props = {
  medicines: PatientDashboardMedicineItem[]
}

function formatMedicineTime(time?: string) {
  if (!time) return "—"
  const match = time.match(/^(\d{2}:\d{2})/)
  return match ? match[1] : time
}

export function PatientDashboardMedicines({ medicines }: Props) {
  const [statusMap, setStatusMap] = useState<Record<number, string>>({})

  const rows = useMemo(
    () =>
      medicines.map((item, index) => ({
        ...item,
        index,
        status: statusMap[index] ?? item.status,
        time: formatMedicineTime(item.time),
      })),
    [medicines, statusMap]
  )

  const toggleStatus = (index: number, current: string) => {
    setStatusMap((prev) => ({
      ...prev,
      [index]: current === "Take" || current === "Taking" ? "Un-take" : "Take",
    }))
  }

  return (
    <section className="rounded-xl border border-[#c8dbe2] bg-[#d5e5eb] p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[#0f172a]">Today&apos;s Medicines</h3>
        <Link
          href="/patient-emr"
          className="text-[11px] text-[#007A94] inline-flex items-center gap-1 hover:underline"
        >
          See details <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-[#d6edf2]">
        <table className="w-full min-w-[720px]">
          <thead className="border-b border-[#e5eff3] bg-[#f8fbfc]">
            <tr className="text-center text-[10px] text-gray-500">
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium text-left">Drug Name</th>
              <th className="px-4 py-3 font-medium">Dosage</th>
              <th className="px-4 py-3 font-medium">Instructions</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((plan) => {
                const isTaken =
                  plan.status === "Take" || plan.status === "Taking"
                return (
                  <tr
                    key={`${plan.drugName}-${plan.index}`}
                    className="border-b border-[#eff5f7] last:border-b-0"
                  >
                    <td className="px-4 py-3 text-[11px] text-gray-700 text-center">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#007A94]" />
                        {plan.time}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] font-medium text-[#0f172a]">
                      {plan.drugName}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-gray-700 text-center">
                      {plan.dosage}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className="bg-[#dff5fa] text-[#0e8cac] border-0 text-[10px] h-5">
                        {plan.instruction}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        type="button"
                        onClick={() => toggleStatus(plan.index, plan.status)}
                        className={`h-7 px-4 text-[10px] rounded-full ${
                          isTaken
                            ? "bg-[#007A94] hover:bg-[#0c83a0] text-white"
                            : "bg-white border border-[#007A94] hover:bg-[#ecf7fa] text-[#007A94]"
                        }`}
                      >
                        <Pill className="w-3.5 h-3.5 mr-1.5" />
                        {plan.status}
                      </Button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-xs text-gray-500">
                  No medicines scheduled for today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
