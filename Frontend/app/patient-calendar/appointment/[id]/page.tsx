"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Bell, ChevronLeft, User, Settings, Calendar, MapPin, Activity, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PatientSidebar } from "@/components/patient-sidebar"
import MedicalReportTab from "@/components/medical-report-tab"
import { appointmentService, type Appointment } from "@/services/appointment.service"
import { authService } from "@/services/auth.service"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/hooks/use-toast"

interface AppointmentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PatientAppointmentDetailPage({ params }: AppointmentDetailPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeTab, setActiveTab] = useState("appointment-details")
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string; fullName: string } | null>(null)
  
  // Unwrap params using React.use()
  const { id } = use(params)

  // Load appointment data
  useEffect(() => {
    const loadAppointment = async () => {
      try {
        setIsLoading(true)
        const user = authService.getUserInfo()
        if (user) {
          setCurrentUser({ 
            id: user.id || "", 
            role: user.role || "",
            fullName: user.fullName || ""
          })
        }
        
        const data = await appointmentService.getAppointmentById(id)
        setAppointment(data)
        
        // If appointment is not COMPLETED and activeTab is medical-report, switch to appointment-details
        if (data.status !== 'COMPLETED' && activeTab === 'medical-report') {
          setActiveTab('appointment-details')
        }
        
        // Note: We don't fetch doctor professional info for patient view
        // because the endpoint requires VIEW_DOCTORS permission which patient doesn't have
        // We'll just use the basic doctor info from appointment response (doctorFullName, doctorName)
        // If you need full doctor info, consider adding it to the appointment response or creating a patient-accessible endpoint
      } catch (error: any) {
        console.error("Error loading appointment:", error)
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải thông tin lịch hẹn",
          variant: "destructive",
        })
        router.push("/patient-calendar")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAppointment()
  }, [id, router, toast])


  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const dateStr = date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const timeStr = date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
    return { date: dateStr, time: timeStr }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'SCHEDULED': { label: 'Upcoming', className: 'bg-cyan-100 text-cyan-700' },
      'IN_PROCESS': { label: 'At Clinic', className: 'bg-green-100 text-green-700' },
      'COMPLETED': { label: 'Completed', className: 'bg-blue-100 text-blue-700' },
      'CANCELED': { label: 'Canceled', className: 'bg-red-100 text-red-700' },
    }
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' }
  }

  // Helper function to get initials from fullName
  const getInitials = (name: string): string => {
    if (!name) return 'PT'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <PatientSidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <PatientSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Không tìm thấy lịch hẹn</p>
            <Link href="/patient-calendar">
              <Button>Quay lại Calendar</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { date: appointmentDate, time: appointmentTime } = formatDateTime(appointment.scheduledStart)
  const endTime = new Date(appointment.scheduledEnd).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })
  const statusBadge = getStatusBadge(appointment.status)

  const notifications = [
    {
      title: "tracto-curia-sunt",
      message: "Terebro taedium alius debitis concedo velit acervus.",
      time: "15 min ago",
    },
    {
      title: "decet-at-tubineus",
      message: "Basium cilicium at odit tenetur coma thalassinus quia derelinquo voluptatem.",
      time: "15 min ago",
    },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <PatientSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="glass border-b border-white/50 px-6 py-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/patient-calendar">
                <Button variant="ghost" size="icon" className="hover:bg-white/50">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl shadow-soft-md">
                  <div className="w-5 h-5 gradient-primary rounded-lg flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h1 className="text-xl font-semibold bg-gradient-to-r from-[#16a1bd] to-[#0d6171] bg-clip-text text-transparent">
                    Appointment #{appointment.id.substring(0, 8)}
                  </h1>
                </div>
                {/* Status Badge */}
                <Badge className={`${statusBadge.className} rounded-full px-4 py-1.5 text-sm font-medium`}>
                  {statusBadge.label}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search..."
                  className="pl-12 w-80 glass border-white/50 hover:bg-white transition-all"
                />
              </div>

              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative gradient-primary text-white hover:opacity-90 shadow-soft hover:shadow-soft-md transition-smooth"
                  >
                    <Bell className="w-5 h-5" />
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full pulse-soft shadow-soft"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96">
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-4">Notifications</h3>
                    <div className="space-y-4">
                      {notifications.map((notif, index) => (
                        <div key={index} className="pb-4 border-b last:border-0">
                          <h4 className="font-medium text-sm mb-1">{notif.title}</h4>
                          <p className="text-sm text-gray-600 mb-1">{notif.message}</p>
                          <span className="text-xs text-gray-400">• {notif.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl hover:bg-white/50 transition-smooth"
                  >
                    <Avatar className="w-9 h-9 ring-2 ring-white shadow-soft">
                      <AvatarImage src="/clean-female-doctor.png" />
                      <AvatarFallback className="gradient-primary text-white font-semibold">
                        {currentUser ? getInitials(currentUser.fullName) : 'PT'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block">
                      <p className="text-sm font-semibold text-gray-700">{currentUser?.fullName || 'Patient'}</p>
                      <p className="text-xs text-gray-500">Patient</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass border-white/50 shadow-soft-lg">
                  <div className="px-3 py-3 border-b border-white/50">
                    <p className="font-semibold text-gray-900">{currentUser?.fullName || 'Patient'}</p>
                    <p className="text-xs text-gray-500 font-medium">Patient</p>
                  </div>
                  <Link href="/my-profile">
                    <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 hover:bg-white/50 transition-smooth">
                      <User className="w-4 h-4 text-[#16a1bd]" />
                      <span className="font-medium">My Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 hover:bg-white/50 transition-smooth">
                      <Settings className="w-4 h-4 text-[#16a1bd]" />
                      <span className="font-medium">Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator className="border-white/50" />
                  <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 transition-smooth">
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Appointment Details (2/3 width) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm">
              {/* Appointment Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{appointment.title || 'No title'}</h2>
              <p className="text-gray-600 mb-6">
                {appointmentDate} • {appointmentTime} - {endTime}
              </p>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-transparent border-b border-gray-300 rounded-none h-auto p-0 mb-6">
                  <TabsTrigger
                    value="appointment-details"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none px-6 pb-3 font-medium"
                  >
                    Appointment Details
                  </TabsTrigger>
                  {/* Only show Medical Report tab if appointment is COMPLETED */}
                  {appointment.status === 'COMPLETED' && (
                    <TabsTrigger
                      value="medical-report"
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none px-6 pb-3 font-medium"
                    >
                      Medical Report
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="appointment-details" className="mt-0">
                  <div className="space-y-6">
                    {/* Patient Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient</h3>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gray-300 text-gray-600 font-bold">
                            {appointment.patientFullName ? 
                              (appointment.patientFullName.split(" ")[0]?.[0] || '') + 
                              (appointment.patientFullName.split(" ").pop()?.[0] || '') 
                              : 'PT'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">{appointment.patientFullName || appointment.patientName || 'Unknown'}</p>
                          {appointment.patientGender && (
                            <p className="text-sm text-gray-600">{appointment.patientGender}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Doctor Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor</h3>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gray-300 text-gray-600 font-bold">
                            {appointment.doctorFullName ? 
                              (appointment.doctorFullName.split(" ")[0]?.[0] || '') + 
                              (appointment.doctorFullName.split(" ").pop()?.[0] || '') 
                              : 'DR'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">{appointment.doctorFullName || appointment.doctorName || 'Unknown'}</p>
                          {appointment.doctorGender && (
                            <p className="text-sm text-gray-600">{appointment.doctorGender}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                              <svg
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-4 text-teal-600"
                              >
                                <path
                                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                            Reason
                          </label>
                          <p className="text-gray-900 font-medium">{appointment.reason || 'N/A'}</p>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                              <svg
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-4 text-teal-600"
                              >
                                <path
                                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                            Symptoms onset
                          </label>
                          <p className="text-gray-900 font-medium">{appointment.symptomsOns || 'N/A'}</p>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                              <svg
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-4 text-teal-600"
                              >
                                <path
                                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                            Symptoms severity
                          </label>
                          <p className="text-gray-900 font-medium">{appointment.symptomsSever || 'N/A'}</p>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                              <svg
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-4 text-teal-600"
                              >
                                <path
                                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                            Medications being used
                          </label>
                          <p className="text-gray-900 font-medium">{appointment.currentMedication || 'N/A'}</p>
                        </div>

                        {appointment.notes && (
                          <div>
                            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                                <svg
                                  width="1em"
                                  height="1em"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="size-4 text-teal-600"
                                >
                                  <path
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </div>
                              Notes
                            </label>
                            <p className="text-gray-900 font-medium">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="medical-report" className="mt-0">
                  <MedicalReportTab appointmentId={appointment.id} appointmentStatus={appointment.status} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - Doctor Info (for patient view) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                {/* Doctor Header */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-xl font-bold">
                        {appointment.doctorFullName ? 
                          (appointment.doctorFullName.split(" ")[0]?.[0] || '') + 
                          (appointment.doctorFullName.split(" ").pop()?.[0] || '') 
                          : 'DR'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorFullName || appointment.doctorName || 'Unknown'}</h3>
                      {appointment.doctorGender && (
                        <p className="text-sm text-gray-500">{appointment.doctorGender}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="py-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Doctor Information</h3>
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.doctorFullName || appointment.doctorName || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Title */}
                    {appointment.doctorTitle && (
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Title</p>
                          <p className="text-sm font-medium text-gray-900">{appointment.doctorTitle}</p>
                        </div>
                      </div>
                    )}

                    {/* Gender */}
                    {appointment.doctorGender && (
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Gender</p>
                          <p className="text-sm font-medium text-gray-900">{appointment.doctorGender}</p>
                        </div>
                      </div>
                    )}

                    {/* Phone Number */}
                    {appointment.doctorPhoneNumber && (
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <svg
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 text-teal-600"
                          >
                            <path
                              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Phone Number</p>
                          <p className="text-sm font-medium text-gray-900">{appointment.doctorPhoneNumber}</p>
                        </div>
                      </div>
                    )}

                    {/* Workplace */}
                    {appointment.doctorWorkplace && (
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Workplace</p>
                          <p className="text-sm font-medium text-gray-900">{appointment.doctorWorkplace}</p>
                        </div>
                      </div>
                    )}

                    {/* Specialties */}
                    {appointment.doctorSpecialties && (
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <Activity className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-2">Specialties</p>
                          <div className="flex flex-wrap gap-1">
                            {appointment.doctorSpecialties
                              .split(',')
                              .map((s) => s.trim())
                              .filter((s) => s.length > 0)
                              .map((specialty, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded"
                                >
                                  {specialty}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

