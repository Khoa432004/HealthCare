"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, ChevronRight, LayoutDashboard, Calendar, User, LogOut, Activity, FileText, Heart, MessageSquare, Settings, Filter, CalendarIcon, Download, Eye, ClipboardPenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PatientSidebar } from "@/components/patient-sidebar"
import { authService } from "@/services/auth.service"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"

interface Appointment {
  id: string
  date: string | Date  // API returns OffsetDateTime as string
  doctor: string
  clinic: string
  reason: string
}

export default function MedicalHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date>()
  const [originalAppointments, setOriginalAppointments] = useState<Appointment[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string; id: string } | null>(null)

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) {
      setUserInfo({
        fullName: user.fullName || 'Patient',
        role: user.role || 'PATIENT',
        id: user.id || ''
      })
    }
  }, [])

  // Helper function to get initials from fullName
  const getInitials = (name: string): string => {
    if (!name) return 'PT'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      authService.clearAuthData()
      router.push('/login')
    }
  }

  const handleSearch = () => {
    let filtered = [...originalAppointments]
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.clinic.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      filtered = filtered.filter(apt => {
        const appointmentDate = new Date(apt.date)
        if (dateFrom && dateTo) {
          return appointmentDate >= dateFrom && appointmentDate <= dateTo
        } else if (dateFrom) {
          return appointmentDate >= dateFrom
        } else if (dateTo) {
          return appointmentDate <= dateTo
        }
        return true
      })
    }
    
    setAppointments(filtered)
  }

  const handleViewDetail = (id: string) => {
    console.log("View detail for appointment:", id)
    router.push(`/patient-medical-examination-history/${id}`)
  }

  const handleDownloadPDF = (id: string) => {
    console.log("Download PDF for appointment:", id)
    // TODO: Implement PDF download
  }

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = authService.getUserInfo()
        if (!user?.id) {
          console.error("User ID not found")
          return
        }

        const data: Appointment[] = await apiClient.get(
          API_ENDPOINTS.PATIENTS.GET_MEDICAL_HISTORY(user.id)
        )
        
        // Convert date strings to Date objects
        const mappedData = data.map((item) => ({
          ...item,
          date: typeof item.date === 'string' ? new Date(item.date) : item.date
        }))
        
        console.log("Fetched medical history:", mappedData)
        setOriginalAppointments(mappedData)
        setAppointments(mappedData)
      } catch (error) {
        console.error("Error fetching medical examination history:", error)
        setAppointments([])
        setOriginalAppointments([])
      }
    }

    fetchHistory()
  }, [])

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#e5f5f8' }}>
      <PatientSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ paddingTop: '16px' }}>
        <header className="bg-white py-4 mx-4 mb-4" style={{ borderRadius: '16px', paddingLeft: '32px', paddingRight: '24px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ClipboardPenLine className="w-5 h-5 text-gray-700" />
                <h1 className="text-xl font-semibold text-gray-900">Lịch sử khám bệnh</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  type="search"
                  placeholder="Search..." 
                  className="pl-10 bg-gray-50 border-gray-200" 
                />
              </div>

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>{userInfo ? getInitials(userInfo.fullName) : 'PT'}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{userInfo?.fullName || 'Patient'}</p>
                      <p className="text-xs text-gray-500">Bệnh nhân</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => router.push('/patient-profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {/* Search and Filter Section */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex gap-4 items-end">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo bác sĩ, chẩn đoán, cơ sở khám..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="shrink-0">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4 bg-gray-50" align="end">
                      <div className="space-y-4">
                        {/* Date From */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Từ ngày</label>
                          <Input
                            type="date"
                            value={dateFrom ? format(dateFrom, "yyyy-MM-dd") : ""}
                            onChange={(e) => setDateFrom(e.target.value ? new Date(e.target.value) : undefined)}
                            className="w-full"
                          />
                        </div>

                        {/* Date To */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Đến ngày</label>
                          <Input
                            type="date"
                            value={dateTo ? format(dateTo, "yyyy-MM-dd") : ""}
                            onChange={(e) => setDateTo(e.target.value ? new Date(e.target.value) : undefined)}
                            className="w-full"
                          />
                        </div>

                        {/* Apply Filter Button */}
                        <Button 
                          onClick={handleSearch} 
                          className="w-full mt-3"
                        >
                          Áp dụng bộ lọc
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {/* Reset Filters Button */}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setDateFrom(undefined)
                      setDateTo(undefined)
                      setSearchTerm("")
                      setAppointments(originalAppointments)
                    }}
                  >
                    Reset
                  </Button>

                  {/* Search Button */}
                  <Button onClick={handleSearch}>
                    Tìm kiếm
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Tìm thấy <span className="font-semibold text-foreground">{appointments.length}</span> lần khám
            </p>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Date and Badge */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-foreground">
                            {format(appointment.date instanceof Date ? appointment.date : new Date(appointment.date), "dd/MM/yyyy")}
                          </span>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Đã hoàn thành
                        </Badge>
                      </div>

                      {/* Doctor Info */}
                      <div>
                        <p className="font-semibold text-lg text-foreground">
                          {appointment.doctor}
                        </p>
                        <p className="text-sm text-muted-foreground">{appointment.clinic}</p>
                      </div>

                      {/* reason */}
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Chẩn đoán:</span>
                        <span className="text-sm text-foreground">{appointment.reason}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 md:flex-col">
                      <Button
                        variant="default"
                        className="flex-1 md:flex-none"
                        onClick={() => handleViewDetail(appointment.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 md:flex-none"
                        onClick={() => handleDownloadPDF(appointment.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Tải PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {appointments.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Không tìm thấy lịch sử khám bệnh phù hợp</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
