"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, CalendarIcon, Eye, FileText, Stethoscope, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/hooks/use-toast"

interface AppointmentHistory {
  id: string
  date: string | Date
  doctor: string
  clinic: string
  reason: string
  patientId: string
  // UC-17: Additional fields for doctors (from medical report)
  diagnosis?: string  // Full diagnosis from medical report
  notes?: string      // Full notes from medical report
  completedAt?: string | Date  // When the medical report was completed
}

interface AppointmentHistoryTabProps {
  patientId: string
}

export default function AppointmentHistoryTab({ patientId }: AppointmentHistoryTabProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPeriod, setFilterPeriod] = useState<"all" | "6months" | "1year">("all")
  const [originalAppointments, setOriginalAppointments] = useState<AppointmentHistory[]>([])
  const [appointments, setAppointments] = useState<AppointmentHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Debug: Log component mount
  useEffect(() => {
    console.log("AppointmentHistoryTab: Component mounted with patientId:", patientId)
  }, [patientId])

  // Fetch medical history
  useEffect(() => {
    const fetchHistory = async () => {
      console.log("AppointmentHistoryTab: Fetching history for patientId:", patientId)
      
      if (!patientId) {
        console.warn("AppointmentHistoryTab: No patientId provided")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        console.log("AppointmentHistoryTab: Calling API:", API_ENDPOINTS.PATIENTS.GET_MEDICAL_HISTORY(patientId))
        
        const data: AppointmentHistory[] = await apiClient.get(
          API_ENDPOINTS.PATIENTS.GET_MEDICAL_HISTORY(patientId)
        )
        
        console.log("AppointmentHistoryTab: Received data:", data)
        
        // Convert date strings to Date objects and sort by date descending
        const mappedData = data
          .map((item) => ({
            ...item,
            date: typeof item.date === 'string' ? new Date(item.date) : item.date
          }))
          .sort((a, b) => {
            const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime()
            const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime()
            return dateB - dateA // Descending order (newest first)
          })
        
        console.log("AppointmentHistoryTab: Mapped and sorted data:", mappedData)
        setOriginalAppointments(mappedData)
        applyFilters(mappedData, searchTerm, filterPeriod)
      } catch (error: any) {
        console.error("AppointmentHistoryTab: Error fetching medical examination history:", error)
        console.error("AppointmentHistoryTab: Error details:", {
          message: error.message,
          response: error.response,
          stack: error.stack
        })
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải lịch sử khám. Vui lòng thử lại.",
          variant: "destructive",
        })
        setAppointments([])
        setOriginalAppointments([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [patientId, toast])

  // Apply filters
  const applyFilters = (
    data: AppointmentHistory[],
    search: string,
    period: "all" | "6months" | "1year"
  ) => {
    let filtered = [...data]

    // Filter by search term
    if (search) {
      filtered = filtered.filter(apt => 
        apt.doctor.toLowerCase().includes(search.toLowerCase()) ||
        apt.reason.toLowerCase().includes(search.toLowerCase()) ||
        apt.clinic.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filter by period
    if (period !== "all") {
      const now = new Date()
      const cutoffDate = new Date()
      
      if (period === "6months") {
        cutoffDate.setMonth(now.getMonth() - 6)
      } else if (period === "1year") {
        cutoffDate.setFullYear(now.getFullYear() - 1)
      }

      filtered = filtered.filter(apt => {
        const appointmentDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
        return appointmentDate >= cutoffDate
      })
    }

    setAppointments(filtered)
  }

  // Handle search input change
  useEffect(() => {
    applyFilters(originalAppointments, searchTerm, filterPeriod)
  }, [searchTerm, filterPeriod, originalAppointments])

  const handleViewDetail = (appointmentId: string) => {
    router.push(`/patient-medical-examination-history/${appointmentId}`)
  }

  const handleFilterChange = (period: "all" | "6months" | "1year") => {
    setFilterPeriod(period)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo bác sĩ, chẩn đoán, cơ sở khám..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
          <Button
            variant={filterPeriod === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("all")}
          >
            Tất cả
          </Button>
          <Button
            variant={filterPeriod === "6months" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("6months")}
          >
            6 tháng gần đây
          </Button>
          <Button
            variant={filterPeriod === "1year" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("1year")}
          >
            1 năm gần đây
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Tìm thấy <span className="font-semibold text-gray-900">{appointments.length}</span> lần khám
        </p>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">Không có lịch sử khám</p>
              <p className="text-sm text-gray-500">
                {searchTerm || filterPeriod !== "all"
                  ? "Không tìm thấy lần khám nào phù hợp với bộ lọc."
                  : "Bệnh nhân chưa có lần khám nào đã hoàn thành."}
              </p>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    {/* Date and Status */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {format(
                            appointment.date instanceof Date 
                              ? appointment.date 
                              : new Date(appointment.date),
                            "dd/MM/yyyy"
                          )}
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Đã hoàn thành
                      </Badge>
                    </div>

                    {/* Doctor Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-gray-500" />
                        <p className="font-semibold text-lg text-gray-900">
                          {appointment.doctor}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span>{appointment.clinic}</span>
                      </div>
                    </div>

                    {/* Diagnosis/Reason */}
                    {/* UC-17: Display diagnosis from medical report (preferred) or reason from appointment */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-gray-600 min-w-[80px]">Chẩn đoán:</span>
                        <span className="text-sm text-gray-900 flex-1">
                          {appointment.diagnosis || appointment.reason || "Không có thông tin"}
                        </span>
                      </div>
                      {/* UC-17: Show full notes for doctors if available */}
                      {appointment.notes && (
                        <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                          <span className="text-sm font-medium text-gray-600 min-w-[80px]">Ghi chú:</span>
                          <span className="text-sm text-gray-700 flex-1">{appointment.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 lg:flex-col lg:min-w-[140px]">
                    <Button
                      variant="default"
                      className="flex-1 lg:flex-none"
                      onClick={() => handleViewDetail(appointment.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

