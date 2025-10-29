"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Calendar,
  Clock,
  User,
  Stethoscope,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Phone,
  Mail,
  MapPin
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CancellationManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const cancellations = [
    {
      id: "CAN001",
      patient: {
        name: "Nguyễn Văn A",
        email: "nguyen.a@email.com",
        phone: "+84 912 345 678",
        avatar: "/placeholder-user.jpg"
      },
      appointment: {
        id: "APT001",
        date: "2025-01-15",
        time: "09:00",
        doctor: {
          name: "Dr. Phạm Linh",
          specialty: "General Medicine",
          avatar: "/professional-doctor-avatar.png"
        },
        service: "General Consultation",
        location: "Room 101, Floor 2"
      },
      cancellation: {
        reason: "Patient emergency",
        requestedDate: "2025-01-14",
        requestedTime: "22:30",
        noticePeriod: "10 hours 30 minutes",
        type: "patient_request"
      },
      status: "pending",
      priority: "high",
      impact: "moderate"
    },
    {
      id: "CAN002",
      patient: {
        name: "Trần Thị B",
        email: "tran.b@email.com",
        phone: "+84 923 456 789",
        avatar: "/placeholder-user.jpg"
      },
      appointment: {
        id: "APT002",
        date: "2025-01-16",
        time: "14:30",
        doctor: {
          name: "Dr. Lê Minh",
          specialty: "Dentistry",
          avatar: "/professional-doctor-avatar.png"
        },
        service: "Dental Checkup",
        location: "Room 205, Floor 3"
      },
      cancellation: {
        reason: "Doctor unavailable - medical conference",
        requestedDate: "2025-01-15",
        requestedTime: "08:00",
        noticePeriod: "1 day 6 hours",
        type: "doctor_request"
      },
      status: "rescheduled",
      priority: "medium",
      impact: "low"
    },
    {
      id: "CAN003",
      patient: {
        name: "Lê Văn C",
        email: "le.c@email.com",
        phone: "+84 934 567 890",
        avatar: "/placeholder-user.jpg"
      },
      appointment: {
        id: "APT003",
        date: "2025-01-18",
        time: "11:15",
        doctor: {
          name: "Dr. Hoàng Nam",
          specialty: "Laboratory",
          avatar: "/professional-doctor-avatar.png"
        },
        service: "Lab Test",
        location: "Lab Room 1, Ground Floor"
      },
      cancellation: {
        reason: "Equipment maintenance",
        requestedDate: "2025-01-17",
        requestedTime: "16:45",
        noticePeriod: "18 hours 30 minutes",
        type: "system_issue"
      },
      status: "cancelled",
      priority: "high",
      impact: "high"
    },
    {
      id: "CAN004",
      patient: {
        name: "Phạm Thị D",
        email: "pham.d@email.com",
        phone: "+84 945 678 901",
        avatar: "/placeholder-user.jpg"
      },
      appointment: {
        id: "APT004",
        date: "2025-01-20",
        time: "16:00",
        doctor: {
          name: "Dr. Nguyễn Hoa",
          specialty: "Cardiology",
          avatar: "/professional-doctor-avatar.png"
        },
        service: "Specialist Consultation",
        location: "Room 301, Floor 4"
      },
      cancellation: {
        reason: "Patient no-show (3rd consecutive)",
        requestedDate: "2025-01-20",
        requestedTime: "16:30",
        noticePeriod: "30 minutes after appointment",
        type: "no_show"
      },
      status: "no_show",
      priority: "medium",
      impact: "moderate"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "rescheduled":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Rescheduled</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      case "no_show":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">No Show</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="text-xs">High</Badge>
      case "medium":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">Medium</Badge>
      case "low":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">Low</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{priority}</Badge>
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">High Impact</Badge>
      case "moderate":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Moderate</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Low Impact</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{impact}</Badge>
    }
  }

  const filteredCancellations = cancellations.filter(cancellation => {
    const matchesSearch = cancellation.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cancellation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cancellation.appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || cancellation.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search cancellations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/70 border-white/50"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white/70 border-white/50">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("pending")}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("rescheduled")}>Rescheduled</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>Cancelled</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("no_show")}>No Show</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span>High Priority: <strong>2</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Pending: <strong>1</strong></span>
          </div>
        </div>
      </div>

      {/* Cancellations List */}
      <div className="grid gap-6">
        {filteredCancellations.map((cancellation) => (
          <Card key={cancellation.id} className="p-6 hover-lift shadow-soft border-white/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={cancellation.patient.avatar} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {cancellation.patient.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{cancellation.patient.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {cancellation.patient.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {cancellation.patient.phone}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Cancellation ID: {cancellation.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(cancellation.priority)}
                {getImpactBadge(cancellation.impact)}
                {getStatusBadge(cancellation.status)}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Appointment Details
                </h4>
                <div className="pl-6 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">{cancellation.appointment.date} at {cancellation.appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{cancellation.appointment.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{cancellation.appointment.service}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Doctor Information
                </h4>
                <div className="pl-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={cancellation.appointment.doctor.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {cancellation.appointment.doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{cancellation.appointment.doctor.name}</p>
                      <p className="text-xs text-gray-500">{cancellation.appointment.doctor.specialty}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Cancellation Details</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Reason:</span>
                  <p className="font-medium">{cancellation.cancellation.reason}</p>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <p className="font-medium capitalize">{cancellation.cancellation.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Requested:</span>
                  <p className="font-medium">{cancellation.cancellation.requestedDate} at {cancellation.cancellation.requestedTime}</p>
                </div>
                <div>
                  <span className="text-gray-600">Notice Period:</span>
                  <p className="font-medium">{cancellation.cancellation.noticePeriod}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {cancellation.status === "pending" && (
                  <>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Reschedule
                    </Button>
                    <Button size="sm" variant="destructive">
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                )}
                {cancellation.status === "rescheduled" && (
                  <Button size="sm" variant="outline">
                    <Calendar className="w-4 h-4 mr-1" />
                    View New Schedule
                  </Button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Patient
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem>Add Notes</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      {filteredCancellations.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <XCircle className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No cancellations found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
