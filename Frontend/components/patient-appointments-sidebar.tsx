"use client"

import { useRouter } from "next/navigation"
import { Upload, PlusCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { PatientDashboardAppointmentItem } from "@/services/dashboard.service"

interface PatientAppointmentsSidebarProps {
  pendingAppointment: PatientDashboardAppointmentItem | null
  weeklyAppointments: PatientDashboardAppointmentItem[]
}

export default function PatientAppointmentsSidebar({
  pendingAppointment,
  weeklyAppointments,
}: PatientAppointmentsSidebarProps) {
  const router = useRouter()

  const openAppointment = (id?: string) => {
    if (!id) return
    router.push(`/patient-calendar/appointment/${id}`)
  }

  return (
    <aside
      className="w-[338px] shrink-0 rounded-[14px] bg-[#e3eaee] p-3"
      style={{ marginRight: "12px", marginTop: "12px", height: "calc(100vh - 24px)" }}
    >
      <div className="h-full overflow-y-auto">
        <div className="mb-3">
          <h3 className="text-[16px] font-semibold text-[#1b1f23]">In-Process Appointment</h3>
          <div className="mt-2 h-px bg-[#ccd7de]" />
        </div>

        {pendingAppointment ? (
          <div
            className="rounded-[14px] border border-[#d1dbe1] bg-white p-3 mb-4 relative cursor-pointer hover:shadow-sm transition-shadow"
            onClick={() => openAppointment(pendingAppointment.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                openAppointment(pendingAppointment.id)
              }
            }}
          >
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-[14px] bg-[#f3a726]" />
            <div className="pl-2 pr-9">
              <p className="text-[13px] font-semibold text-[#20262b]">{pendingAppointment.doctor}</p>
              <p className="text-[11px] text-[#6b7280]">{pendingAppointment.time}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <Avatar className="h-5 w-5 border border-white">
                  <AvatarImage src="/professional-doctor-avatar.png" />
                  <AvatarFallback className="text-[9px]">DR</AvatarFallback>
                </Avatar>
                <Avatar className="h-5 w-5 border border-white -ml-1">
                  <AvatarImage src="/professional-doctor-avatar.png" />
                  <AvatarFallback className="text-[9px]">PT</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#0d8fae] text-[#0d8fae]"
              onClick={(e) => {
                e.stopPropagation()
                openAppointment(pendingAppointment.id)
              }}
            >
              <Upload className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="rounded-[14px] border border-dashed border-[#c3d2d9] bg-white p-4 mb-4 text-center text-[12px] text-[#6b7280]">
            No data available
          </div>
        )}

        <div>
          <h3 className="text-[16px] font-semibold text-[#1b1f23]">Upcoming Appointment</h3>
          <div className="mt-2 h-px bg-[#ccd7de]" />
          <div className="mt-3 space-y-3">
            {weeklyAppointments.length > 0 ? weeklyAppointments.map((item, index) => (
              <div key={`${item.day}-${item.date}-${item.time}-${item.doctor}-${index}`}>
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-[#20262b]">{item.day}</span>
                  <span className="text-[#737d86]">{item.date}</span>
                </div>
                <div
                  className="rounded-[12px] border border-[#d1dbe1] bg-white p-3 cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => openAppointment(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      openAppointment(item.id)
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-[#20262b]">{item.doctor}</p>
                      <p className="text-[11px] text-[#6b7280]">{item.time}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Avatar className="h-5 w-5 border border-white">
                          <AvatarImage src="/professional-doctor-avatar.png" />
                          <AvatarFallback className="text-[9px]">DR</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-5 w-5 border border-white -ml-1">
                          <AvatarImage src="/professional-doctor-avatar.png" />
                          <AvatarFallback className="text-[9px]">PT</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <PlusCircle className="h-4 w-4 text-[#0d8fae]" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="rounded-[14px] border border-dashed border-[#c3d2d9] bg-white p-4 text-center text-[12px] text-[#6b7280]">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
