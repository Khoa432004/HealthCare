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
  UserPlus,
  DollarSign,
  Calendar,
  Clock,
  Star,
  MoreVertical,
  Eye,
  Edit,
  CreditCard,
  TrendingUp,
  Users,
  Stethoscope,
  Award,
  MapPin,
  Phone,
  Mail
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DoctorManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("current")

  // Mock data for doctors
  const doctors = [
    {
      id: "DOC001",
      name: "Dr. Phạm Linh",
      email: "pham.linh@hospital.com",
      phone: "+84 912 345 678",
      avatar: "/professional-doctor-avatar.png",
      specialty: "General Medicine",
      experience: "8 years",
      rating: 4.8,
      totalPatients: 1245,
      appointmentsThisMonth: 89,
      salary: {
        base: 25000000,
        bonus: 5000000,
        total: 30000000,
        status: "paid",
        paidDate: "2025-01-01"
      },
      performance: {
        satisfaction: 96,
        onTime: 94,
        revenue: 245000000,
        change: "+8.2%"
      },
      schedule: {
        workingDays: "Mon-Fri",
        hours: "8:00-17:00",
        location: "Room 101, Floor 2"
      },
      status: "active",
      joinDate: "2020-03-15"
    },
    {
      id: "DOC002",
      name: "Dr. Lê Minh",
      email: "le.minh@hospital.com",
      phone: "+84 923 456 789",
      avatar: "/professional-doctor-avatar.png",
      specialty: "Dentistry",
      experience: "12 years",
      rating: 4.9,
      totalPatients: 892,
      appointmentsThisMonth: 67,
      salary: {
        base: 28000000,
        bonus: 7000000,
        total: 35000000,
        status: "pending",
        dueDate: "2025-01-15"
      },
      performance: {
        satisfaction: 98,
        onTime: 97,
        revenue: 283500000,
        change: "+12.1%"
      },
      schedule: {
        workingDays: "Mon-Sat",
        hours: "9:00-18:00",
        location: "Room 205, Floor 3"
      },
      status: "active",
      joinDate: "2018-07-20"
    },
    {
      id: "DOC003",
      name: "Dr. Hoàng Nam",
      email: "hoang.nam@hospital.com",
      phone: "+84 934 567 890",
      avatar: "/professional-doctor-avatar.png",
      specialty: "Laboratory Medicine",
      experience: "6 years",
      rating: 4.6,
      totalPatients: 567,
      appointmentsThisMonth: 45,
      salary: {
        base: 22000000,
        bonus: 3000000,
        total: 25000000,
        status: "paid",
        paidDate: "2025-01-01"
      },
      performance: {
        satisfaction: 94,
        onTime: 91,
        revenue: 187200000,
        change: "+5.4%"
      },
      schedule: {
        workingDays: "Mon-Fri",
        hours: "7:00-16:00",
        location: "Lab Room 1, Ground Floor"
      },
      status: "active",
      joinDate: "2021-09-10"
    },
    {
      id: "DOC004",
      name: "Dr. Nguyễn Hoa",
      email: "nguyen.hoa@hospital.com",
      phone: "+84 945 678 901",
      avatar: "/professional-doctor-avatar.png",
      specialty: "Cardiology",
      experience: "15 years",
      rating: 4.9,
      totalPatients: 678,
      appointmentsThisMonth: 52,
      salary: {
        base: 35000000,
        bonus: 10000000,
        total: 45000000,
        status: "pending",
        dueDate: "2025-01-15"
      },
      performance: {
        satisfaction: 99,
        onTime: 96,
        revenue: 196000000,
        change: "+18.7%"
      },
      schedule: {
        workingDays: "Mon-Fri",
        hours: "8:30-17:30",
        location: "Room 301, Floor 4"
      },
      status: "active",
      joinDate: "2015-02-28"
    },
    {
      id: "DOC005",
      name: "Dr. Trần Văn Đức",
      email: "tran.duc@hospital.com",
      phone: "+84 956 789 012",
      avatar: "/professional-doctor-avatar.png",
      specialty: "Orthopedics",
      experience: "10 years",
      rating: 4.7,
      totalPatients: 789,
      appointmentsThisMonth: 61,
      salary: {
        base: 30000000,
        bonus: 8000000,
        total: 38000000,
        status: "paid",
        paidDate: "2025-01-01"
      },
      performance: {
        satisfaction: 95,
        onTime: 93,
        revenue: 268000000,
        change: "+3.2%"
      },
      schedule: {
        workingDays: "Mon-Fri",
        hours: "8:00-17:00",
        location: "Room 401, Floor 5"
      },
      status: "on_leave",
      joinDate: "2019-11-05"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "on_leave":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">On Leave</Badge>
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSalaryStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || doctor.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const pendingPayments = doctors.filter(d => d.salary.status === "pending")
  const totalPendingAmount = pendingPayments.reduce((sum, d) => sum + d.salary.total, 0)

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search doctors..." 
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
              <DropdownMenuItem onClick={() => setFilterStatus("active")}>Active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("on_leave")}>On Leave</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("inactive")}>Inactive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>Pending Payments: <strong>₫{totalPendingAmount.toLocaleString()}</strong></span>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 shadow-soft border-white/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Doctors</p>
              <p className="text-xl font-bold text-gray-900">{doctors.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 shadow-soft border-white/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Doctors</p>
              <p className="text-xl font-bold text-gray-900">{doctors.filter(d => d.status === "active").length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 shadow-soft border-white/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-xl font-bold text-gray-900">{pendingPayments.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 shadow-soft border-white/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-xl font-bold text-gray-900">
                {(doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length).toFixed(1)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Doctors List */}
      <div className="grid gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="p-6 hover-lift shadow-soft border-white/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={doctor.avatar} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.specialty} • {doctor.experience}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {doctor.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {doctor.totalPatients} patients
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {doctor.appointmentsThisMonth} this month
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(doctor.status)}
                {getSalaryStatusBadge(doctor.salary.status)}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-4">
              {/* Contact Information */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Information
                </h4>
                <div className="pl-6 space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {doctor.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {doctor.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {doctor.schedule.location}
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Salary Information
                </h4>
                <div className="pl-6 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Salary:</span>
                    <span className="font-medium">₫{doctor.salary.base.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bonus:</span>
                    <span className="font-medium">₫{doctor.salary.bonus.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-gray-900 font-medium">Total:</span>
                    <span className="font-bold text-emerald-600">₫{doctor.salary.total.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {doctor.salary.status === "paid" ? `Paid on ${doctor.salary.paidDate}` : `Due on ${doctor.salary.dueDate}`}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Performance
                </h4>
                <div className="pl-6 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Satisfaction:</span>
                    <span className="font-medium">{doctor.performance.satisfaction}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">On Time:</span>
                    <span className="font-medium">{doctor.performance.onTime}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">₫{doctor.performance.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Change:</span>
                    <span className="font-medium text-green-600">{doctor.performance.change}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {doctor.salary.status === "pending" && (
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <CreditCard className="w-4 h-4 mr-1" />
                    Process Payment
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Details
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
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="w-4 h-4 mr-2" />
                    View Schedule
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Payment History
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Doctor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Stethoscope className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No doctors found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
