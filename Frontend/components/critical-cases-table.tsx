"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ChevronRight, FileText } from "lucide-react"
import type { Appointment } from "@/services/appointment.service"
import type { CriticalCase } from "@/services/doctor-statistics.service"
import Link from "next/link"

interface CriticalCasesTableProps {
  inProcessAppointments?: Appointment[]
  criticalCases?: CriticalCase[]
}

export default function CriticalCasesTable({ inProcessAppointments = [], criticalCases = [] }: CriticalCasesTableProps) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase()

  const formatMetricType = (metric: string) =>
    metric
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())

  const formatStatus = (status: string) => status.toLowerCase() === "high" ? "High" : "Low"

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl shadow-soft-lg border-white/50 p-6 hover-lift">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-[#16a1bd] to-[#0d6171] bg-clip-text text-transparent">Top Critical Cases</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="glass border-white/50 hover:bg-white transition-smooth">
              BP
            </Badge>
            <Badge className="gradient-primary border-0 shadow-soft">BG</Badge>
            <Badge variant="outline" className="glass border-white/50 hover:bg-white transition-smooth">
              KET
            </Badge>
            <Badge variant="outline" className="glass border-white/50 hover:bg-white transition-smooth">
              Hct
            </Badge>
            <Badge variant="outline" className="glass border-white/50 hover:bg-white transition-smooth">
              UA
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-[#16a1bd] hover:bg-white/50 transition-smooth">
            See details <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/50 glass rounded-t-xl">
                <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">ID Account</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Patient</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Chronic conditions</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Result</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm"></th>
              </tr>
            </thead>
            <tbody>
              {criticalCases.map((case_) => (
                <tr key={case_.patientId} className="border-b border-white/30 hover:bg-white/50 transition-smooth">
                  <td className="py-4 px-4 text-sm text-gray-700 font-medium">{case_.patientId.slice(0, 8)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-9 h-9 gradient-primary ring-2 ring-white shadow-soft">
                        <AvatarFallback className="text-xs font-semibold text-white gradient-primary">{getInitials(case_.patientName)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-gray-900">{case_.patientName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{formatMetricType(case_.metricType)}</td>
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">{case_.result}</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col space-y-1.5">
                      <Badge
                        className={`${case_.status.toLowerCase() === "high" ? "bg-red-100 text-red-700 border-red-200" : "bg-orange-100 text-orange-700 border-orange-200"} w-fit shadow-soft`}
                      >
                        {formatStatus(case_.status)}
                      </Badge>
                      <Badge className="gradient-primary text-white w-fit text-xs border-0 shadow-soft">
                        🍽️ {case_.mealTime || "N/A"}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Button variant="ghost" size="sm" className="rounded-xl hover:bg-white transition-smooth">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {criticalCases.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-500">
                    No abnormal vital measurements found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass rounded-3xl shadow-soft-lg border-white/50 p-6 hover-lift">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-[#16a1bd] to-[#0d6171] bg-clip-text text-transparent">Pending Medical Report</h3>
          <Button variant="ghost" size="sm" className="text-[#16a1bd] hover:bg-white/50 transition-smooth">
            See details <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Appointment ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Patient</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Schedule</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Reason</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {inProcessAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-b border-white/30 hover:bg-white/50 transition-smooth">
                  <td className="py-4 px-4 text-sm text-gray-700 font-medium">{appointment.id.slice(0, 8)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-9 h-9 gradient-primary ring-2 ring-white shadow-soft">
                        <AvatarFallback className="text-xs font-semibold text-white gradient-primary">
                          {(appointment.patientFullName || appointment.patientName || "PT")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-gray-900">
                        {appointment.patientFullName || appointment.patientName || "Patient"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(appointment.scheduledStart).toLocaleDateString("vi-VN")}{" "}
                    {new Date(appointment.scheduledStart).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{appointment.reason || "--"}</td>
                  <td className="py-4 px-4">
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">In-process</Badge>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link href={`/calendar/appointment/${appointment.id}?tab=medical-report`}>
                      <Button size="sm" className="bg-[#16a1bd] hover:bg-[#0d6171] text-white">
                        Complete report
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inProcessAppointments.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400">
              <FileText className="w-12 h-12 mb-3" />
              <span className="text-sm">No data available</span>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
