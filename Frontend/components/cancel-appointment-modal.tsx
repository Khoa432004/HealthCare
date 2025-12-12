"use client"

import { useState } from "react"
import { X, Calendar, Clock, MapPin, User, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { appointmentService, type Appointment } from "@/services/appointment.service"

interface CancelAppointmentModalProps {
  appointment: Appointment
  onClose: () => void
  onSuccess?: (updatedAppointment: Appointment) => void
}

export function CancelAppointmentModal({ appointment, onClose, onSuccess }: CancelAppointmentModalProps) {
  const { toast } = useToast()
  const [isCanceling, setIsCanceling] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")

  const handleCancel = async () => {
    try {
      setIsCanceling(true)
      const updatedAppointment = await appointmentService.cancelAppointment(
        appointment.id,
        cancellationReason || undefined
      )

      toast({
        title: "Thành công",
        description: "Hủy lịch khám thành công",
      })

      if (onSuccess) {
        onSuccess(updatedAppointment)
      }
      onClose()
    } catch (error: any) {
      console.error("Error canceling appointment:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể hủy lịch khám. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsCanceling(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const dateStr = date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const timeStr = date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
    return { date: dateStr, time: timeStr }
  }

  const { date: appointmentDate, time: appointmentTime } = formatDateTime(appointment.scheduledStart)
  const endTime = new Date(appointment.scheduledEnd).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900">Xác nhận hủy lịch khám</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Bạn có chắc chắn muốn hủy lịch khám này? Hành động này không thể hoàn tác.
            </p>
          </div>

          {/* Appointment Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">Thông tin lịch khám</h3>
            
            {/* Doctor Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4 text-teal-600" />
                Bác sĩ
              </div>
              <p className="text-gray-900 ml-6">{appointment.doctorFullName || appointment.doctorName || 'Unknown'}</p>
              {appointment.doctorTitle && (
                <p className="text-sm text-gray-600 ml-6">{appointment.doctorTitle}</p>
              )}
            </div>

            {/* Clinic/Workplace */}
            {appointment.doctorWorkplace && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  Cơ sở khám
                </div>
                <p className="text-gray-900 ml-6">{appointment.doctorWorkplace}</p>
              </div>
            )}

            {/* Date & Time */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 text-teal-600" />
                Ngày khám
              </div>
              <p className="text-gray-900 ml-6">{appointmentDate}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock className="w-4 h-4 text-teal-600" />
                Giờ khám
              </div>
              <p className="text-gray-900 ml-6">{appointmentTime} - {endTime}</p>
            </div>
          </div>

          {/* Cancellation Reason (Optional) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Lý do hủy (tùy chọn)
            </label>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Nhập lý do hủy lịch khám..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isCanceling}
          >
            Đóng
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isCanceling}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isCanceling ? "Đang xử lý..." : "Xác nhận hủy"}
          </Button>
        </div>
      </div>
    </div>
  )
}

