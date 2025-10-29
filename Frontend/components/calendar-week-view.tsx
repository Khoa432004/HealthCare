"use client"

import { useState } from "react"
import { Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface Event {
  id: string
  title: string
  date: Date
  startTime: string
  endTime: string
  doctor?: string
  patient?: string
  status: "upcoming" | "pending" | "cancelled" | "completed"
  description?: string
}

interface CalendarWeekViewProps {
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
    patient: "Nguyễn Văn Nam",
    status: "upcoming",
  },
  {
    id: "2",
    title: "Nguyễn Văn A",
    date: new Date(2025, 9, 20),
    startTime: "09:35",
    endTime: "10:05",
    doctor: "Lê Thị Tuyết Hoa",
    patient: "Nguyễn Văn A",
    status: "upcoming",
  },
]

export function CalendarWeekView({ currentDate }: CalendarWeekViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Get the start of the week (Monday)
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return date
  })

  const getEventsForDay = (date: Date) => {
    return SAMPLE_EVENTS.filter((event) => event.date.toDateString() === date.toDateString())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-cyan-100 text-cyan-700 border-cyan-300"
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-300"
      case "completed":
        return "bg-green-100 text-green-700 border-green-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
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
                      className={`w-full text-left px-3 py-2 rounded border transition-all hover:shadow-md ${getStatusColor(
                        event.status,
                      )}`}
                    >
                      <div className="font-medium text-sm truncate">{event.title}</div>
                      <div className="text-xs opacity-75">{event.startTime}</div>
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
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">{selectedEvent?.title} - Appointment Details</DialogTitle>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {selectedEvent.date.toLocaleDateString()} • {selectedEvent.startTime} - {selectedEvent.endTime}
                </span>
              </div>

              {selectedEvent.doctor && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 mt-1 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Doctor</p>
                    <p className="font-medium">{selectedEvent.doctor}</p>
                  </div>
                </div>
              )}

              {selectedEvent.patient && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 mt-1 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Patient</p>
                    <p className="font-medium">{selectedEvent.patient}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1 bg-transparent">
                  Edit
                </Button>
                <Button className="flex-1 gradient-primary text-white">View Details</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
