/**
 * API Client
 * Handles all HTTP requests to the backend
 */

import { API_BASE_URL, STORAGE_KEYS, API_ENDPOINTS } from './api-config'

// Re-export API_ENDPOINTS for convenience
export { API_ENDPOINTS }

export interface ApiResponse<T = any> {
  statusCode: number
  message: string
  data?: T
}

export interface ApiError {
  error: string
  message: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * Get access token from localStorage
   */
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getAccessToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    }

    try {
      console.log('API Request:', { method: options.method || 'GET', url, headers: config.headers })
      const response = await fetch(url, config)
      console.log('API Response:', { status: response.status, statusText: response.statusText, url })
      
      // Handle different response statuses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'unknown_error',
          message: 'Mất kết nối. Vui lòng thử lại.',
        }))
        console.error('API Error Response:', errorData)
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const jsonData = await response.json()
      console.log('API Response Data:', jsonData)
      return jsonData
    } catch (error: any) {
      console.error('API Request Error:', error)
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Mất kết nối. Vui lòng thử lại.')
      }
      
      // Re-throw the error if it already has a message
      if (error.message) {
        throw error
      }
      
      throw new Error('Mất kết nối. Vui lòng thử lại.')
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)

