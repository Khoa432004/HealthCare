import { apiClient, API_ENDPOINTS } from '@/lib/api-client'

export interface DashboardFilter {
  period: 'today' | 'week' | 'month' | 'year' | 'custom'
  fromDate?: string // ISO date string (YYYY-MM-DD)
  toDate?: string // ISO date string (YYYY-MM-DD)
}

export interface DashboardStats {
  totalUsers: number
  pendingDoctors: number
  totalAppointments: number
  revenue: number
  doctorSalaries: number
  platformProfit: number
  completedAppointments: number
  canceledAppointments: number
  scheduledAppointments: number
}

export interface PatientDashboardMetricCard {
  name: string
  value: number
  unit: string
  status: string
  deltaText: string
}

export interface PatientDashboardTrendPoint {
  day: string
  value: number
}

export interface PatientDashboardCurrentPlan {
  title: string
  status: string
  progressPercent: number
  daysLeft: number
  appointmentSummary: string
  startDate: string
  endDate: string
}

export interface PatientDashboardMedicineItem {
  time: string
  drugName: string
  dosage: string
  instruction: string
  status: string
}

export interface PatientDashboardAppointmentItem {
  id: string
  day: string
  date: string
  doctor: string
  time: string
}

export interface PatientDashboardOverview {
  metricCards: PatientDashboardMetricCard[]
  glucoseTrend: PatientDashboardTrendPoint[]
  currentPlan: PatientDashboardCurrentPlan
  todayMedicines: PatientDashboardMedicineItem[]
  pendingAppointment: PatientDashboardAppointmentItem | null
  weeklyAppointments: PatientDashboardAppointmentItem[]
}

interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
  error?: {
    message: string
  }
}

class DashboardService {
  async getDashboardStats(filter?: DashboardFilter): Promise<DashboardStats> {
    const requestBody = filter || { period: 'week' }
    const response = await apiClient.post<ApiResponse<DashboardStats>>(
      API_ENDPOINTS.DASHBOARD.GET_STATS,
      requestBody
    )

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch dashboard stats')
    }

    return response.data
  }

  async getPatientOverview(): Promise<PatientDashboardOverview> {
    const response = await apiClient.get<ApiResponse<PatientDashboardOverview>>(
      API_ENDPOINTS.DASHBOARD.GET_PATIENT_OVERVIEW
    )

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch patient dashboard overview')
    }

    return response.data
  }
}

export const dashboardService = new DashboardService()

