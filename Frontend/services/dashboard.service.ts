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
    console.log('📊 Dashboard Request:', requestBody)
    
    const response = await apiClient.post<ApiResponse<DashboardStats>>(
      API_ENDPOINTS.DASHBOARD.GET_STATS,
      requestBody
    )

    console.log('📊 Dashboard Response:', response)

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch dashboard stats')
    }

    return response.data
  }
}

export const dashboardService = new DashboardService()

