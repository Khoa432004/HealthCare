import { apiClient } from '@/lib/api-client'

export interface DoctorStatisticsFilter {
  period?: 'today' | 'yesterday' | 'last7days' | 'thisMonth' | 'custom'
  fromDate?: string // ISO date string (YYYY-MM-DD)
  toDate?: string // ISO date string (YYYY-MM-DD)
  facilityName?: string
}

export interface PendingReportAppointment {
  appointmentId: string
  patientName: string
  patientPhone: string
  scheduledStart: string
  status: string
  medicalReportId: string | null
}

export interface DoctorStatistics {
  totalPatientsToday: number
  completedAppointments: number
  pendingReportAppointments: number
  dailyRevenue: number
  pendingReports: PendingReportAppointment[]
}

interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
  error?: {
    message: string
  }
}

class DoctorStatisticsService {
  async getDoctorStatistics(filter?: DoctorStatisticsFilter): Promise<DoctorStatistics> {
    const requestBody = filter || { period: 'today' }
    const response = await apiClient.post<ApiResponse<DoctorStatistics>>(
      '/api/v1/doctors/statistics',
      requestBody
    )

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch doctor statistics')
    }

    return response.data
  }
}

export const doctorStatisticsService = new DoctorStatisticsService()

