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
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Calendar,
  User,
  MoreVertical,
  Eye,
  Check,
  X
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function RefundManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const refunds = [
    {
      id: "REF001",
      patient: {
        name: "Nguyễn Văn A",
        email: "nguyen.a@email.com",
        avatar: "/placeholder-user.jpg"
      },
      appointment: {
        date: "2025-01-15",
        time: "09:00",
        doctor: "Dr. Phạm Linh",
        service: "General Consultation"
      },
      amount: 500000,
      reason: "Patient cancelled appointment less than 24h",
      status: "pending",
      requestedDate: "2025-01-14",
      priority: "high"
    },
    {
      id: "REF002",
      patient: {
        name: "Trần Thị B",
        email: "tran.b@email.com",
        avatar: "/placeholder-user.jpg"
      },
      appointment: {
        date: "2025-01-16",
        time: "14:30",
        doctor: "Dr. Lê Minh",
        service: "Dental Checkup"
      },
      amount: 750000,
      reason: "Service not provided as described",
      status: "approved",
      requestedDate: "2025-01-12",
      priority: "medium"
    },
    {
      id: "REF003",
      patient: {
        name: "Lê Văn C",
        email: "le.c@email.com",
        avatar: "/placeholder-user.jpg"
      },
      appointment: {
        date: "2025-01-18",
        time: "11:15",
        doctor: "Dr. Hoàng Nam",
        service: "Lab Test"
      },
      amount: 300000,
      reason: "Test results delayed beyond promised timeframe",
      status: "rejected",
      requestedDate: "2025-01-10",
      priority: "low"
    },
    {
      id: "REF004",
      patient: {
        name: "Phạm Thị D",
        email: "pham.d@email.com",
        avatar: "/placeholder-user.jpg"
      },
      appointment: {
        date: "2025-01-20",
        time: "16:00",
        doctor: "Dr. Nguyễn Hoa",
        service: "Specialist Consultation"
      },
      amount: 1200000,
      reason: "Doctor no-show",
      status: "pending",
      requestedDate: "2025-01-19",
      priority: "high"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
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

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = refund.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || refund.status === filterStatus
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
              placeholder="Search refunds..." 
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
              <DropdownMenuItem onClick={() => setFilterStatus("approved")}>Approved</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("rejected")}>Rejected</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>Total Pending: <strong>₫1,700,000</strong></span>
        </div>
      </div>

      {/* Refunds List */}
      <div className="grid gap-4">
        {filteredRefunds.map((refund) => (
          <Card key={refund.id} className="p-6 hover-lift shadow-soft border-white/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={refund.patient.avatar} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {refund.patient.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{refund.patient.name}</h3>
                  <p className="text-sm text-gray-500">{refund.patient.email}</p>
                  <p className="text-xs text-gray-400">Refund ID: {refund.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(refund.priority)}
                {getStatusBadge(refund.status)}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Appointment:</span>
                  <span className="font-medium">{refund.appointment.date} at {refund.appointment.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium">{refund.appointment.doctor}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Service: </span>
                  <span className="font-medium">{refund.appointment.service}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-emerald-600">₫{refund.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Requested:</span>
                  <span className="font-medium">{refund.requestedDate}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Reason: </span>
                {refund.reason}
              </p>
            </div>

            {refund.status === "pending" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
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
                    <DropdownMenuItem>Contact Patient</DropdownMenuItem>
                    <DropdownMenuItem>Add Notes</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredRefunds.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <DollarSign className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No refunds found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
