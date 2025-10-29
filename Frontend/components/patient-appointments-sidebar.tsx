"use client"

import { useState } from "react"
import { Calendar, Clock, MapPin, User, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function PatientAppointmentsSidebar() {
  const [selectedAppointment, setSelectedAppointment] = useState(0)

  const todayAppointments = [
    {
      id: 1,
      doctor: {
        name: "Dr. Phạm Linh",
        specialty: "General Medicine",
        avatar: "/professional-doctor-avatar.png"
      },
      time: "09:00 AM",
      duration: "30 min",
      status: "confirmed",
      location: "Room 101, Floor 2",
      type: "Follow-up"
    },
    {
      id: 2,
      doctor: {
        name: "Dr. Lê Minh",
        specialty: "Dentistry",
        avatar: "/professional-doctor-avatar.png"
      },
      time: "02:30 PM",
      duration: "45 min",
      status: "pending",
      location: "Room 205, Floor 3",
      type: "Consultation"
    },
    {
      id: 3,
      doctor: {
        name: "Dr. Hoàng Nam",
        specialty: "Laboratory",
        avatar: "/professional-doctor-avatar.png"
      },
      time: "04:00 PM",
      duration: "15 min",
      status: "confirmed",
      location: "Lab Room 1, Ground Floor",
      type: "Lab Test"
    }
  ]

  const upcomingAppointments = [
    {
      id: 4,
      doctor: {
        name: "Dr. Nguyễn Hoa",
        specialty: "Cardiology",
        avatar: "/professional-doctor-avatar.png"
      },
      date: "Tomorrow",
      time: "10:00 AM",
      status: "confirmed",
      type: "Specialist Consultation"
    },
    {
      id: 5,
      doctor: {
        name: "Dr. Trần Văn Đức",
        specialty: "Orthopedics",
        avatar: "/professional-doctor-avatar.png"
      },
      date: "Jan 18, 2025",
      time: "03:00 PM",
      status: "pending",
      type: "Follow-up"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="w-80 glass border-l border-white/50 flex flex-col shadow-soft-lg">
      {/* Header */}
      <div className="p-6 border-b border-white/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-[#16a1bd] to-[#16a1bd] bg-clip-text text-transparent">
            My Appointments
          </h2>
          <Button size="sm" className="bg-[#16a1bd] hover:bg-[#138a9f] text-white">
            <Plus className="w-4 h-4 mr-1" />
            Book
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Today's Appointments */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Today's Appointments
          </h3>
          <div className="space-y-3">
            {todayAppointments.map((appointment, index) => (
              <div
                key={appointment.id}
                className={`p-4 glass rounded-2xl cursor-pointer transition-all hover:bg-white hover-lift shadow-soft ${
                  selectedAppointment === appointment.id ? 'ring-2 ring-[#16a1bd]' : ''
                }`}
                onClick={() => setSelectedAppointment(appointment.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={appointment.doctor.avatar} />
                      <AvatarFallback className="bg-[#16a1bd] text-white text-sm">
                        {appointment.doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{appointment.doctor.name}</p>
                      <p className="text-xs text-gray-500">{appointment.doctor.specialty}</p>
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-3 h-3 mr-2" />
                    <span>{appointment.time} • {appointment.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-3 h-3 mr-2" />
                    <span>{appointment.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{appointment.type}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Upcoming
          </h3>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 glass rounded-2xl hover:bg-white transition-smooth cursor-pointer hover-lift shadow-soft">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={appointment.doctor.avatar} />
                      <AvatarFallback className="bg-[#16a1bd] text-white text-sm">
                        {appointment.doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{appointment.doctor.name}</p>
                      <p className="text-xs text-gray-500">{appointment.doctor.specialty}</p>
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span>{appointment.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-3 h-3 mr-2" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{appointment.type}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/50">
        <Button variant="outline" className="w-full glass border-white/50 hover:bg-white transition-smooth">
          View All Appointments
        </Button>
      </div>
    </div>
  )
}
