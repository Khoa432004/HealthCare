"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Circle } from "lucide-react"

const appointments = [
  { time: "08:00", title: "Health Checkup - Pham Linh", subtitle: "07:30 - 08:00", status: "default" },
  { time: "09:00", title: "Health Checkup - Pham Linh", subtitle: "09:00 - 10:00", status: "active" },
  { time: "10:00", title: "Health Checkup - Pham Linh", subtitle: "10:00 - 11:00", status: "default" },
  { time: "11:00", title: "Health Checkup - Pham Linh", subtitle: "11:00 - 11:30", status: "default" },
  { time: "12:00", title: "Health Checkup - Pham Linh", subtitle: "12:00 - 13:00", status: "default" },
  { time: "13:00", title: "Health Checkup - Pham Linh", subtitle: "13:00 - 14:00", status: "default" },
  { time: "14:00", title: "Health Checkup - Pham Linh", subtitle: "14:00 - 15:00", status: "default" },
  { time: "15:00", title: "Health Checkup", subtitle: "Health Checkup", status: "multiple" },
  { time: "16:00", title: "Health Checkup - Pham Linh", subtitle: "16:00 - 17:00", status: "default" },
  { time: "17:00", title: "Health Checkup - Pham Linh", subtitle: "17:00 - 18:00", status: "default" },
  { time: "18:00", title: "Health Checkup - Pham Linh", subtitle: "18:00 - 19:00", status: "default" },
  { time: "19:00", title: "Health Checkup - Pham Linh", subtitle: "19:00 - 20:00", status: "active" },
  { time: "20:00", title: "Health Checkup - Pham Linh", subtitle: "20:00 - 21:00", status: "default" },
]

export default function TodayAppointmentsSidebar() {
  return (
    <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 uppercase tracking-wide">THURSDAY</span>
          <Avatar className="w-10 h-10 ring-2 ring-gray-100">
            <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">LE</AvatarFallback>
          </Avatar>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-6">Today Appointments (9)</h3>

        <div className="space-y-2">
          {appointments.map((appointment, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 transition-all ${
                appointment.status === "active"
                  ? "bg-[#16a1bd] border-[#16a1bd] text-white"
                  : appointment.status === "multiple"
                    ? "bg-red-50 border-red-200"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div
                    className={`text-xs font-medium mb-1 ${appointment.status === "active" ? "text-white/80" : "text-gray-500"}`}
                  >
                    {appointment.time}
                  </div>
                  <div
                    className={`text-sm font-semibold mb-1 ${appointment.status === "active" ? "text-white" : "text-gray-900"}`}
                  >
                    {appointment.title}
                  </div>
                  <div className={`text-xs ${appointment.status === "active" ? "text-white/70" : "text-gray-500"}`}>
                    {appointment.subtitle}
                  </div>
                </div>
                {appointment.status === "active" && <Circle className="w-2 h-2 fill-white text-white mt-1" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
