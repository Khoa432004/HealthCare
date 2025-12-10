"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Clock, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { appointmentService, type Appointment } from "@/services/appointment.service"

interface RescheduleAppointmentModalProps {
  appointment: Appointment
  onClose: () => void
  onSuccess?: (updatedAppointment: Appointment) => void
}

export function RescheduleAppointmentModal({ appointment, onClose, onSuccess }: RescheduleAppointmentModalProps) {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string; displayTime: string } | null>(null)
  const [availableSlots, setAvailableSlots] = useState<Array<{ startTime: string; endTime: string; displayTime: string }>>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0]

  // Load available slots when date is selected
  useEffect(() => {
    if (selectedDate && appointment.doctorId) {
      loadAvailableSlots()
    } else {
      setAvailableSlots([])
      setSelectedSlot(null)
    }
  }, [selectedDate, appointment.doctorId])

  const loadAvailableSlots = async () => {
    if (!selectedDate || !appointment.doctorId) return

    try {
      setIsLoadingSlots(true)
      const response = await appointmentService.getAvailableSlots(
        appointment.doctorId,
        selectedDate,
        appointment.id // Exclude current appointment from conflicts
      )
      setAvailableSlots(response.availableSlots || [])
      setSelectedSlot(null) // Reset selected slot when slots change
    } catch (error: any) {
      console.error("Error loading available slots:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải khung giờ trống",
        variant: "destructive",
      })
      setAvailableSlots([])
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleReschedule = async () => {
    if (!selectedDate || !selectedSlot) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ngày và giờ mới",
        variant: "destructive",
      })
      return
    }

    try {
      setIsRescheduling(true)
      const updatedAppointment = await appointmentService.rescheduleAppointment(
        appointment.id,
        selectedSlot.startTime,
        selectedSlot.endTime
      )

      toast({
        title: "Thành công",
        description: "Đổi lịch khám thành công",
      })

      if (onSuccess) {
        onSuccess(updatedAppointment)
      }
      onClose()
    } catch (error: any) {
      console.error("Error rescheduling appointment:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đổi lịch khám. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsRescheduling(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Đổi lịch khám</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Doctor Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Bác sĩ
            </h3>
            <p className="text-gray-700">{appointment.doctorFullName || appointment.doctorName || 'Unknown'}</p>
            {appointment.doctorTitle && (
              <p className="text-sm text-gray-600">{appointment.doctorTitle}</p>
            )}
            {appointment.doctorWorkplace && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 text-teal-600" />
                <span>{appointment.doctorWorkplace}</span>
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Chọn ngày mới
            </label>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                Chọn giờ mới
              </label>
              
              {isLoadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {selectedDate ? "Không có khung giờ trống cho ngày này" : "Vui lòng chọn ngày trước"}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSlot?.startTime === slot.startTime
                          ? "bg-teal-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {slot.displayTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Time Display */}
          {selectedSlot && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Thời gian đã chọn:</p>
              <p className="font-semibold text-teal-700">
                {formatDate(selectedSlot.startTime)} • {selectedSlot.displayTime}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isRescheduling}
          >
            Hủy
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!selectedDate || !selectedSlot || isRescheduling}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isRescheduling ? "Đang xử lý..." : "Xác nhận đổi"}
          </Button>
        </div>
      </div>
    </div>
  )
}

