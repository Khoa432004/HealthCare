/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient, type ApiResponse } from '@/lib/api-client'
import { API_ENDPOINTS, STORAGE_KEYS } from '@/lib/api-config'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: {
    id: string
    email: string
    fullName: string
    role: string
    accountStatus: string
    firstLoginRequired: boolean
  }
}

export interface RegisterData {
  username?: string
  email: string
  password: string
  fullName: string
  phone: string
  phoneNumber?: string // Alias for phone
  role: string
  identityCard?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  department?: string
}

export interface PersonalInfoData {
  fullName: string
  phone: string
  email: string
  identityCard: string
  dateOfBirth: string
  gender: string
  address: string
  country?: string
  state?: string
  city?: string
  zipCode?: string
  addressLine1?: string
  addressLine2?: string
}

export interface ProfessionalInfoData {
  userId: string
  email: string
  cccdNumber?: string
  password: string
  title: string
  currentProvince?: string
  clinicHospital: string
  careForAdults: boolean
  careForChildren: boolean
  specialties: string[]
  treatmentConditions: string[]
  practicingCertificationId: string
  languages?: string[]
  workFromYear?: number
  workToYear?: number
  workClinicHospital?: string
  workLocation?: string
  workSpecialties?: string[]
  educationalInstitution?: string
  graduationYear?: number
  specialty?: string
  department: string
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    )

    // Store tokens and user info in localStorage
    if (response.data) {
      this.storeAuthData(response.data)
    }

    return response
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<ApiResponse> {
    return await apiClient.post<ApiResponse>(API_ENDPOINTS.AUTH.REGISTER, data)
  }

  /**
   * Register personal information (Step 1)
   */
  async registerPersonalInfo(data: PersonalInfoData): Promise<ApiResponse> {
    return await apiClient.post<ApiResponse>(
      API_ENDPOINTS.AUTH.REGISTER_PERSONAL,
      data
    )
  }

  /**
   * Register professional information (Step 2 - for doctors)
   */
  async registerProfessionalInfo(data: ProfessionalInfoData): Promise<ApiResponse> {
    return await apiClient.post<ApiResponse>(
      API_ENDPOINTS.AUTH.REGISTER_PROFESSIONAL,
      data
    )
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken()
    
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {
        refreshToken,
      })
    } finally {
      // Clear local storage regardless of API response
      this.clearAuthData()
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    const refreshToken = this.getRefreshToken()
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refresh_token: refreshToken }
    )

    if (response.data) {
      this.storeAuthData(response.data)
    }

    return response
  }

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    const user = this.getUserInfo()
    return await apiClient.put<ApiResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      email: user?.email,
      oldPassword,
      newPassword,
    })
  }

  /**
   * Change password on first login
   */
  async changePasswordOnFirstLogin(email: string, newPassword: string, confirmPassword: string): Promise<ApiResponse> {
    return await apiClient.put<ApiResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD_FIRST_LOGIN, {
      email,
      newPassword,
      confirmPassword,
    })
  }

  /**
   * Forget password - send OTP
   */
  async forgetPassword(email: string): Promise<ApiResponse> {
    return await apiClient.post<ApiResponse>(API_ENDPOINTS.AUTH.FORGET_PASSWORD, {
      email,
    })
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(email: string, otp: string, newPassword: string): Promise<ApiResponse> {
    return await apiClient.post<ApiResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      email,
      otp,
      newPassword,
    })
  }

  /**
   * Approve doctor account (Admin only)
   */
  async approveDoctor(userId: string): Promise<ApiResponse> {
    return await apiClient.post<ApiResponse>(`/api/auth/admin/approve-doctor/${userId}`)
  }

  /**
   * Store authentication data in localStorage
   */
  private storeAuthData(data: LoginResponse): void {
    if (typeof window === 'undefined') return

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token)
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(data.user))
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, data.user.role)
    
    // Also set cookies for middleware access
    document.cookie = `access_token=${data.access_token}; path=/; max-age=86400; SameSite=Strict`
    document.cookie = `user_role=${data.user.role}; path=/; max-age=86400; SameSite=Strict`
  }

  /**
   * Clear authentication data from localStorage
   */
  clearAuthData(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE)
    
    // Also clear cookies
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }

  /**
   * Get refresh token
   */
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  /**
   * Get user info
   */
  getUserInfo(): LoginResponse['user'] | null {
    if (typeof window === 'undefined') return null
    
    const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO)
    return userInfo ? JSON.parse(userInfo) : null
  }

  /**
   * Get user role
   */
  getUserRole(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.USER_ROLE)
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  /**
   * Get dashboard route based on user role
   */
  getDashboardRoute(role: string): string {
    const roleMap: Record<string, string> = {
      ADMIN: '/admin-dashboard',
      CLINIC_ADMIN: '/admin-dashboard',
      DOCTOR: '/doctor-dashboard',
      PATIENT: '/patient-dashboard',
    }

    return roleMap[role.toUpperCase()] || '/patient-dashboard'
  }
}

// Export singleton instance
export const authService = new AuthService()

