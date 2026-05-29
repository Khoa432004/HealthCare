"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, ChevronLeft, User, Calendar, MapPin, Activity, Droplets, Clock, X, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientSidebar } from "@/components/patient-sidebar"
import { NotificationBell } from "@/components/notification-bell"
import { PatientUserMenu } from "@/components/patient-user-menu"
import MedicalReportTab from "@/components/medical-report-tab"
import { RescheduleAppointmentModal } from "@/components/reschedule-appointment-modal"
import { CancelAppointmentModal } from "@/components/cancel-appointment-modal"
import { appointmentService, type Appointment } from "@/services/appointment.service"
import { authService } from "@/services/auth.service"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { getAppointmentLocationLabel, resolveAppointmentFormatFromTitle } from "@/lib/appointment-format"
import { useTranslation } from "react-i18next"

interface AppointmentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PatientAppointmentDetailPage({ params }: AppointmentDetailPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("appointment-details")
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string; fullName: string } | null>(null)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const { t } = useTranslation()
  const [showCancelModal, setShowCancelModal] = useState(false)
  
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
        const statusUpper = data.status?.toUpperCase()
        if (statusUpper !== 'COMPLETED' && activeTab === 'medical-report') {
          setActiveTab('appointment-details')
        }
        
        // Note: We don't fetch doctor professional info for patient view
        // because the endpoint requires VIEW_DOCTORS permission which patient doesn't have
        // We'll just use the basic doctor info from appointment response (doctorFullName, doctorName)
        // If you need full doctor info, consider adding it to the appointment response or creating a patient-accessible endpoint
      } catch (error: any) {
        console.error("Error loading appointment:", error)
        toast({
          title: t("error"),
          description: error.message || t("appointmentLoadFailed"),
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
      'SCHEDULED': { label: t('upcoming'), className: 'bg-cyan-100 text-cyan-700' },
      'IN_PROCESS': { label: t('inProgress'), className: 'bg-green-100 text-green-700' },
      'COMPLETED': { label: t('completed'), className: 'bg-blue-100 text-blue-700' },
      'CANCELED': { label: t('canceled'), className: 'bg-red-100 text-red-700' },
    }
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' }
  }

  const canJoinVideoCall = (): boolean => {
    if (!appointment || !currentUser) return false
    if (resolveAppointmentFormatFromTitle(appointment.title) !== "online") return false
    const status = appointment.status?.toUpperCase()
    if (status !== "IN_PROCESS") return false
    const role = currentUser.role?.toUpperCase()
    const isPatientRole = role === "PATIENT" || currentUser.role === "patient"
    if (!isPatientRole) return false
    return String(currentUser.id).trim() === String(appointment.patientId).trim()
  }

  // Check if reschedule button should be shown
  // Button is shown when: status = SCHEDULED, user is patient, and >= 4 hours before scheduled start
  const canReschedule = (): boolean => {
    if (!appointment) return false
    
    // Status must be SCHEDULED
    const status = appointment.status?.toUpperCase()
    if (status !== 'SCHEDULED') {
      return false
    }
    
    // Must be at least 4 hours before scheduled start
    const now = new Date()
    const scheduledStart = new Date(appointment.scheduledStart)
    const hoursUntilAppointment = (scheduledStart.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilAppointment < 4) {
      return false
    }
    
    return true
  }

  // Check if cancel button should be shown
  // Button is shown when: status = SCHEDULED, user is patient, and >= 8 hours before scheduled start
  const canCancel = (): boolean => {
    if (!appointment) return false
    
    // Status must be SCHEDULED
    const status = appointment.status?.toUpperCase()
    if (status !== 'SCHEDULED') {
      return false
    }
    
    // Must be at least 8 hours before scheduled start
    const now = new Date()
    const scheduledStart = new Date(appointment.scheduledStart)
    const hoursUntilAppointment = (scheduledStart.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilAppointment < 8) {
      return false
    }
    
    return true
  }

  // Handle reschedule success
  const handleRescheduleSuccess = (updatedAppointment: Appointment) => {
    setAppointment(updatedAppointment)
    setShowRescheduleModal(false)
  }

  // Handle cancel success
  const handleCancelSuccess = (updatedAppointment: Appointment) => {
    setAppointment(updatedAppointment)
    setShowCancelModal(false)
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
            <p className="text-gray-500 mb-4">{t("appointmentNotFound")}</p>
            <Link href="/patient-calendar">
              <Button>{t("backToCalendar")}</Button>
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
  const appointmentFormatLabel = getAppointmentLocationLabel(appointment.title)
  const isOnlineAppointment = resolveAppointmentFormatFromTitle(appointment.title) === "online"

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
                  <h1 className="text-xl font-semibold bg-gradient-to-r from-[#007A94] to-[#005566] bg-clip-text text-transparent">
                    Appointment #{appointment.id.substring(0, 8)}
                  </h1>
                </div>
                {/* Status Badge */}
                <Badge className={`${statusBadge.className} rounded-full px-4 py-1.5 text-sm font-medium`}>
                  {statusBadge.label}
                </Badge>
                {canJoinVideoCall() && (
                  <Link href={`/video-call/${appointment.id}`}>
                    <Button
                      type="button"
                      size="sm"
                      className="ml-2 bg-[#007A94] text-white hover:bg-[#005566]"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      {t("videoCall")}
                    </Button>
                  </Link>
                )}
                {/* Reschedule Button (only for patient, when conditions are met) */}
                {canReschedule() && (
                  <Button 
                    onClick={() => setShowRescheduleModal(true)}
                    className="ml-2 bg-teal-600 hover:bg-teal-700 text-white"
                    size="sm"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t("rescheduleAppointment")}
                  </Button>
                )}
                {/* Cancel Button (only for patient, when conditions are met) */}
                {canCancel() && (
                  <Button 
                    onClick={() => setShowCancelModal(true)}
                    variant="destructive"
                    className="ml-2 bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t("cancelAppointment")}
                  </Button>
                )}
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

              <NotificationBell />

              <PatientUserMenu
                userInfo={currentUser ? { fullName: currentUser.fullName } : null}
                triggerClassName="flex items-center space-x-3 glass px-4 py-2 rounded-2xl hover:bg-white/50 transition-smooth"
                contentClassName="w-56 glass border-white/50 shadow-soft-lg"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Appointment Details (2/3 width) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm">
              {/* Appointment Title */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{appointment.title || t('noTitle')}</h2>
              <p className="text-gray-600 mb-2">
                {appointmentDate} • {appointmentTime} - {endTime}
              </p>
              <div className="flex items-center gap-2 mb-6">
                <Badge
                  variant="outline"
                  className={
                    isOnlineAppointment
                      ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                      : "border-teal-200 bg-teal-50 text-teal-700"
                  }
                >
                  {isOnlineAppointment ? (
                    <Video className="mr-1.5 h-3.5 w-3.5" />
                  ) : (
                    <MapPin className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {appointmentFormatLabel}
                </Badge>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-transparent border-b border-gray-300 rounded-none h-auto p-0 mb-6">
                  <TabsTrigger
                    value="appointment-details"
                    className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none px-6 pb-3 font-medium"
                  >
                    {t("appointmentDetails")}
                  </TabsTrigger>
                  {/* Show Medical Report tab if appointment is COMPLETED (case-insensitive) */}
                  {(appointment.status?.toUpperCase() === 'COMPLETED' || appointment.status === 'completed') && (
                    <TabsTrigger
                      value="medical-report"
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 rounded-none px-6 pb-3 font-medium"
                    >
                      {t("medicalReport")}
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="appointment-details" className="mt-0">
                  <div className="space-y-6">
                    {/* Patient Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("patient")}</h3>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("doctor")}</h3>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("details")}</h3>
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
                            {t("reason")}
                          </label>
                          <p className="text-gray-900 font-medium">{appointment.reason || t("na")}</p>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 text-teal-600">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="currentColor" />
                              </svg>
                            </div>
                            {t("symptomsOnset")}
                          </label>
                          <p className="text-gray-900 font-medium">{appointment.symptomsOns || t("na")}</p>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 text-teal-600">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="currentColor" />
                              </svg>
                            </div>
                            {t("symptomsSeverity")}
                          </label>
                          <p className="text-gray-900 font-medium">{appointment.symptomsSever || t("na")}</p>
                        </div>

                        <div>
                          <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 text-teal-600">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="currentColor" />
                              </svg>
                            </div>
                            {t("medicationsBeingUsed")}
                          </label>
                          <p className="text-gray-900 font-medium">{appointment.currentMedication || t("na")}</p>
                        </div>

                        {appointment.notes && (
                          <div>
                            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 text-teal-600">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="currentColor" />
                                </svg>
                              </div>
                              {t("notes")}
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
                  <h3 className="text-base font-semibold text-gray-900 mb-4">{t("doctorInformation")}</h3>
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">{t("name")}</p>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.doctorFullName || appointment.doctorName || t('unknownPerson')}
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
                          <p className="text-xs text-gray-500">{t("titleLabel")}</p>
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
                          <p className="text-xs text-gray-500">{t("gender")}</p>
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
                          <p className="text-xs text-gray-500">{t("phoneNumber")}</p>
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
                          <p className="text-xs text-gray-500">{t("workplace")}</p>
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
                          <p className="text-xs text-gray-500 mb-2">{t("specialties")}</p>
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

      {/* Reschedule Modal */}
      {showRescheduleModal && appointment && (
        <RescheduleAppointmentModal
          appointment={appointment}
          onClose={() => setShowRescheduleModal(false)}
          onSuccess={handleRescheduleSuccess}
        />
      )}

      {/* Cancel Modal */}
      {showCancelModal && appointment && (
        <CancelAppointmentModal
          appointment={appointment}
          onClose={() => setShowCancelModal(false)}
          onSuccess={handleCancelSuccess}
        />
      )}
    </div>
  )
}

