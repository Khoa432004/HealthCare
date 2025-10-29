"use client"

import { useState } from "react"
import { Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

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

interface CalendarDayViewProps {
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
  {
    id: "3",
    title: "Test 1",
    date: new Date(2025, 9, 20),
    startTime: "11:18",
    endTime: "11:48",
    doctor: "Lê Thị Tuyết Hoa",
    patient: "Test Patient",
    status: "pending",
  },
]

export function CalendarDayView({ currentDate }: CalendarDayViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const dayEvents = SAMPLE_EVENTS.filter((event) => event.date.toDateString() === currentDate.toDateString())

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

  // Generate time slots
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0")
    return `${hour}:00`
  })

  return (
    <>
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h2>

          {dayEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No events scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-lg ${getStatusColor(
                    event.status,
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-sm opacity-75">
                        {event.startTime} - {event.endTime}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(event.status)}`}>{event.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
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
