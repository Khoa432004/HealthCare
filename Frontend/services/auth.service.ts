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
  }
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  phoneNumber: string
  role: string
}

export interface PersonalInfoData {
  identityCard: string
  fullName: string
  dateOfBirth: string
  gender: string
  phoneNumber: string
  address: string
  email: string
  password: string
  role: string
}

export interface ProfessionalInfoData {
  userId: string
  specialization: string
  licenseNumber: string
  experience: string
  qualifications: string
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
   * Store authentication data in localStorage
   */
  private storeAuthData(data: LoginResponse): void {
    if (typeof window === 'undefined') return

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token)
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(data.user))
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, data.user.role)
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

