"use client"

import { PendingReportAppointment } from "@/services/doctor-statistics.service"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { format } from "date-fns"

interface PendingReportsTableProps {
  appointments: PendingReportAppointment[]
  onAppointmentClick: (appointmentId: string) => void
}

export default function PendingReportsTable({ appointments, onAppointmentClick }: PendingReportsTableProps) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có ca khám nào chờ hoàn thành báo cáo
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tên BN</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SĐT</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Giờ hẹn</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trạng thái</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr
              key={appointment.appointmentId}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4 text-sm text-gray-900">{appointment.patientName}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{appointment.patientPhone}</td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {format(new Date(appointment.scheduledStart), "dd/MM/yyyy HH:mm")}
              </td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  IN-PROCESS
                </span>
              </td>
              <td className="py-3 px-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAppointmentClick(appointment.appointmentId)}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Mở báo cáo</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

