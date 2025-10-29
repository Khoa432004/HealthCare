"use client"

import { useState } from "react"
import { User, Edit2, MoreVertical, X, Stethoscope, Heart, Pill, Frown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

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

interface CalendarMonthViewProps {
  currentDate: Date
}

// Sample events data
const SAMPLE_EVENTS: Event[] = [
  {
    id: "1",
    title: "Sale Demo",
    date: new Date(2025, 9, 14),
    startTime: "03:00",
    endTime: "03:30",
    doctor: "Lê Thị Tuyết Hoa",
    doctorGender: "Female",
    patient: "Nguyễn Văn Nam",
    patientGender: "Male",
    status: "upcoming",
    location: "At Clinic",
    reason: "test",
    symptomsOnset: "test",
    symptomsSeverity: "test",
    medicationsUsed: "test",
  },
  {
    id: "2",
    title: "Nguyễn Văn A",
    date: new Date(2025, 9, 20),
    startTime: "09:35",
    endTime: "10:05",
    doctor: "Lê Thị Tuyết Hoa",
    doctorGender: "Female",
    patient: "Nguyễn Văn A",
    patientGender: "Male",
    status: "upcoming",
    location: "At Clinic",
    reason: "Consultation",
    symptomsOnset: "2 days ago",
    symptomsSeverity: "Mild",
    medicationsUsed: "Paracetamol",
  },
  {
    id: "3",
    title: "Test 1",
    date: new Date(2025, 9, 20),
    startTime: "11:18",
    endTime: "11:48",
    doctor: "Lê Thị Tuyết Hoa",
    doctorGender: "Female",
    patient: "Test Patient",
    patientGender: "Male",
    status: "pending",
    location: "At Clinic",
    reason: "Medical test",
    symptomsOnset: "test",
    symptomsSeverity: "test",
    medicationsUsed: "test",
  },
]

export function CalendarMonthView({ currentDate }: CalendarMonthViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Get the first day of the month and number of days
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Get events for this month
  const monthEvents = SAMPLE_EVENTS.filter(
    (event) =>
      event.date.getMonth() === currentDate.getMonth() && event.date.getFullYear() === currentDate.getFullYear(),
  )

  // Create calendar grid
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  const getEventsForDay = (day: number) => {
    return monthEvents.filter((event) => event.date.getDate() === day)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis w-full flex flex-col relative z-20 rounded-md p-4 bg-teal-50 text-teal-600 border-teal-600 border border-l-[4px]"
      case "pending":
        return "cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis w-full flex flex-col relative z-20 rounded-md p-4 bg-teal-50 text-teal-600 border-teal-600 border border-l-[4px]"
      case "cancelled":
        return "cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis w-full flex flex-col relative z-20 rounded-md p-4 bg-red-50 text-red-600 border-red-600 border border-l-[4px]"
      case "completed":
        return "cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis w-full flex flex-col relative z-20 rounded-md p-4 bg-green-50 text-green-600 border-green-600 border border-l-[4px]"
      default:
        return "cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis w-full flex flex-col relative z-20 rounded-md p-4 bg-gray-50 text-gray-600 border-gray-600 border border-l-[4px]"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

  return (
    <>
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="bg-gray-50 px-4 py-3 text-center font-semibold text-sm text-gray-700 border-b border-gray-200"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const dayEvents = day ? getEventsForDay(day) : []
            const isCurrentMonth = day !== null
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear()

            return (
              <div
                key={index}
                className={`min-h-32 p-3 border border-gray-200 ${
                  !isCurrentMonth ? "bg-gray-50" : isToday ? "bg-blue-50" : "bg-white"
                } hover:bg-gray-50 transition-colors`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-semibold mb-2 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className={`w-full text-left px-2 py-1 rounded text-xs font-medium truncate border transition-all hover:shadow-md ${getStatusColor(
                            event.status,
                          )}`}
                          title={`${event.title} - ${event.startTime}`}
                        >
                          <div className="truncate">{event.title}</div>
                          <div className="text-xs opacity-75">{event.startTime}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogTitle className="sr-only">{selectedEvent?.title} - Appointment Details</DialogTitle>
          {selectedEvent && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header with badges and actions */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-2">
                  <span data-slot="badge" className="inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-300 overflow-hidden shadow-soft border-transparent [a&amp;]:hover:bg-primary/90 [a&amp;]:hover:scale-105 bg-[#16A1BD] hover:bg-teal-600 text-white">Up Coming</span>
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
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedEvent.doctor} (Doctor)</p>
                    </div>
                  </div>
                </div>

                {/* Patient section */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Patient</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                      {getInitials(selectedEvent.patient || "")}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedEvent.patient}</p>
                      <p className="text-sm text-gray-500">{selectedEvent.patientGender}</p>
                    </div>
                  </div>
                </div>

                {/* Doctor section */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Doctor</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                      {getInitials(selectedEvent.doctor || "")}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedEvent.doctor}</p>
                      <p className="text-sm text-gray-500">{selectedEvent.doctorGender}</p>
                    </div>
                  </div>
                </div>

                {/* Details section */}
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
              </div>

              {/* Footer with View Details button */}
              <div className="px-6 py-4 border-t border-gray-200">
                <Link href={`/calendar/appointment/${selectedEvent.id}`} className="w-full">
                  <button className="inline-flex items-center justify-center gap-2 rounded-full truncate transition font-semibold select-none w-full px-3.5 py-2.5 text-sm bg-[#e5f5f8] border border-[#0d6171] text-[#0d6171] " type="button">       
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
