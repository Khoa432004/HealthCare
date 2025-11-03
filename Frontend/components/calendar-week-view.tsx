"use client"

import { useState } from "react"
import { Edit2, MoreVertical, X, Stethoscope, Heart, Pill, Frown } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Appointment, AppointmentStatus } from "@/services/appointment.service"

interface Event {
  id: string
  title: string
  date: Date
  startTime: string
  endTime: string
  doctor?: string
  doctorGender?: string
  patient?: string
  patientGender?: string
  status: "upcoming" | "pending" | "cancelled" | "completed"
  location?: string
  reason?: string
  symptomsOnset?: string
  symptomsSeverity?: string
  medicationsUsed?: string
}

interface CalendarWeekViewProps {
  currentDate: Date
  appointments?: Appointment[]
  userRole?: 'DOCTOR' | 'PATIENT'
}

export function CalendarWeekView({ currentDate, appointments = [], userRole }: CalendarWeekViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Convert Appointment to Event format
  const convertAppointmentToEvent = (appointment: Appointment): Event => {
    const scheduledStart = new Date(appointment.scheduledStart)
    const scheduledEnd = new Date(appointment.scheduledEnd)
    
    // Format time as HH:MM
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    }

    // Map appointment status to event status
    // Backend returns lowercase: "scheduled", "canceled", "completed", "in_process"
    const mapStatus = (status: AppointmentStatus): "upcoming" | "pending" | "cancelled" | "completed" => {
      if (!status) {
        return 'pending'
      }
      
      const statusUpper = String(status).toUpperCase().trim()
      
      switch (statusUpper) {
        case 'SCHEDULED':
          return 'upcoming'
        case 'IN_PROCESS':
          return 'upcoming'
        case 'CANCELED':
        case 'CANCELLED':
          return 'cancelled'
        case 'COMPLETED':
          return 'completed'
        default:
          return 'pending'
      }
    }

    // Get partner name based on user role
    const getPartnerName = () => {
      if (userRole === 'DOCTOR') {
        return appointment.patientFullName || appointment.patientName || 'Patient'
      } else {
        return appointment.doctorFullName || appointment.doctorName || 'Doctor'
      }
    }

    return {
      id: appointment.id,
      title: appointment.title || getPartnerName(),
      date: scheduledStart,
      startTime: formatTime(scheduledStart),
      endTime: formatTime(scheduledEnd),
      doctor: appointment.doctorFullName || appointment.doctorName,
      doctorGender: appointment.doctorGender,
      patient: appointment.patientFullName || appointment.patientName,
      patientGender: appointment.patientGender,
      status: mapStatus(appointment.status),
      location: "At Clinic",
      reason: appointment.reason || undefined,
      symptomsOnset: appointment.symptomsOns || undefined,
      symptomsSeverity: appointment.symptomsSever || undefined,
      medicationsUsed: appointment.currentMedication || undefined,
    }
  }

  // Get the start of the week (Monday)
  const startOfWeek = new Date(currentDate)
  const dayOfWeek = startOfWeek.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Adjust for Monday as first day
  startOfWeek.setDate(currentDate.getDate() + diff)
  startOfWeek.setHours(0, 0, 0, 0)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return date
  })

  // Convert appointments to events and filter for this week
  const weekEvents = appointments
    .map(convertAppointmentToEvent)
    .filter((event) => {
      const eventDate = event.date
      return eventDate >= startOfWeek && eventDate < new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
    })

  const getEventsForDay = (date: Date) => {
    return weekEvents.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear()
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-50 text-blue-700 border-blue-300 border-l-[3px]"
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-300 border-l-[3px]"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-300 border-l-[3px]"
      case "completed":
        return "bg-green-50 text-green-700 border-green-300 border-l-[3px]"
      default:
        return "bg-gray-50 text-gray-700 border-gray-300 border-l-[3px]"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return {
          text: "Up Coming",
          className: "bg-[#16A1BD] hover:bg-teal-600 text-white"
        }
      case "pending":
        return {
          text: "Pending",
          className: "bg-yellow-500 hover:bg-yellow-600 text-white"
        }
      case "cancelled":
        return {
          text: "Cancelled",
          className: "bg-red-500 hover:bg-red-600 text-white"
        }
      case "completed":
        return {
          text: "Completed",
          className: "bg-green-500 hover:bg-green-600 text-white"
        }
      default:
        return {
          text: "Unknown",
          className: "bg-gray-500 hover:bg-gray-600 text-white"
        }
    }
  }

  const getInitials = (name: string) => {
    if (!name) return ''
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  const weekDayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

  return (
    <>
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="grid grid-cols-7 gap-0 border border-gray-200">
          {/* Week day headers */}
          {weekDays.map((date, index) => (
            <div key={index} className="bg-gray-50 px-4 py-3 text-center border-b border-gray-200">
              <p className="font-semibold text-sm text-gray-700">{weekDayNames[index]}</p>
              <p className="text-xs text-gray-500">{date.getDate()}</p>
            </div>
          ))}

          {/* Week events */}
          {weekDays.map((date, index) => {
            const dayEvents = getEventsForDay(date)
            const isToday = date.toDateString() === new Date().toDateString()

            return (
              <div
                key={index}
                className={`min-h-96 p-3 border border-gray-200 ${
                  isToday ? "bg-blue-50" : "bg-white"
                } hover:bg-gray-50 transition-colors`}
              >
                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className={`w-full text-left px-2 py-1.5 rounded border transition-all hover:shadow-md ${getStatusColor(
                        event.status,
                      )}`}
                      title={`${event.title} - ${event.startTime}-${event.endTime} - ${userRole === 'DOCTOR' ? event.patient : event.doctor}`}
                    >
                      <div className="font-semibold text-xs truncate">{event.title}</div>
                      <div className="text-xs opacity-75">{event.startTime}-{event.endTime}</div>
                      <div className="text-xs opacity-60 truncate mt-0.5">
                        {userRole === 'DOCTOR' ? event.patient : event.doctor}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden" showCloseButton={false}>
          <DialogTitle className="sr-only">{selectedEvent?.title} - Appointment Details</DialogTitle>
          {selectedEvent && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header with badges and actions */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-2">
                    {(() => {
                      const statusBadge = getStatusBadge(selectedEvent.status)
                      return (
                        <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 ${statusBadge.className}`}>
                          {statusBadge.text}
                        </span>
                      )
                    })()}
                    {selectedEvent.location && (
                      <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                        {selectedEvent.location}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <Edit2 className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setIsDialogOpen(false)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Title and time */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h2>
                <p className="text-sm text-gray-600">
                  {selectedEvent.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · {selectedEvent.startTime} - {selectedEvent.endTime}
                </p>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {/* Doctor info */}
                {selectedEvent.doctor && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Doctor</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                        {getInitials(selectedEvent.doctor)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedEvent.doctor}</p>
                        <p className="text-sm text-gray-500">{selectedEvent.doctorGender}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Patient section */}
                {selectedEvent.patient && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Patient</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                        {getInitials(selectedEvent.patient)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedEvent.patient}</p>
                        <p className="text-sm text-gray-500">{selectedEvent.patientGender}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Details section */}
                {(selectedEvent.reason || selectedEvent.symptomsOnset || selectedEvent.symptomsSeverity || selectedEvent.medicationsUsed) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Details</h3>
                    <div className="space-y-3">
                      {selectedEvent.reason && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#e5f5f8] flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-4 h-4 text-cyan-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Reason</p>
                            <p className="text-sm text-gray-600">{selectedEvent.reason}</p>
                          </div>
                        </div>
                      )}

                      {selectedEvent.symptomsOnset && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#e5f5f8] flex items-center justify-center flex-shrink-0">
                            <Heart className="w-4 h-4 text-cyan-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Symptoms onset</p>
                            <p className="text-sm text-gray-600">{selectedEvent.symptomsOnset}</p>
                          </div>
                        </div>
                      )}

                      {selectedEvent.symptomsSeverity && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#e5f5f8] flex items-center justify-center flex-shrink-0">
                            <Frown className="w-4 h-4 text-cyan-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Symptoms severity</p>
                            <p className="text-sm text-gray-600">{selectedEvent.symptomsSeverity}</p>
                          </div>
                        </div>
                      )}

                      {selectedEvent.medicationsUsed && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#e5f5f8] flex items-center justify-center flex-shrink-0">
                            <Pill className="w-4 h-4 text-cyan-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Medications being used</p>
                            <p className="text-sm text-gray-600">{selectedEvent.medicationsUsed}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with View Details button */}
              <div className="px-6 py-4 border-t border-gray-200">
                <Link href={`/calendar/appointment/${selectedEvent.id}`} className="w-full">
                  <button className="inline-flex items-center justify-center gap-2 rounded-full truncate transition font-semibold select-none w-full px-3.5 py-2.5 text-sm bg-[#e5f5f8] border border-[#0d6171] text-[#0d6171]" type="button">
                    View details
                  </button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
