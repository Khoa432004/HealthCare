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
        let errorData: any = {}
        let responseText = ''
        try {
          responseText = await response.text()
          
          // Only log detailed error info for non-400 errors (400 is usually validation/conflict which is expected)
          if (response.status !== 400) {
            console.error('API Error Response Text:', responseText)
            console.error('API Error Response Status:', response.status)
            console.error('API Error Response Headers:', Object.fromEntries(response.headers.entries()))
          }
          
          if (responseText && responseText.trim()) {
            try {
              const parsed = JSON.parse(responseText)
              // Only use parsed data if it has meaningful content
              if (parsed && (parsed.message || parsed.error || parsed.details || parsed.errors || Object.keys(parsed).length > 0)) {
                errorData = parsed
                // Spring Boot default error format: {"timestamp":"...","status":405,"error":"Method Not Allowed","path":"/api/..."}
                // Extract message from Spring Boot error format
                if (errorData.status && errorData.error && !errorData.message) {
                  errorData.message = `${errorData.error} for path ${errorData.path || 'unknown'}`
                }
              } else {
                // Parsed but empty or invalid, use raw text
                errorData = {
                  error: 'parse_error',
                  message: responseText,
                  rawText: responseText
                }
              }
            } catch (parseError) {
              // If JSON parse fails, use text as message
              errorData = {
                error: 'parse_error',
                message: responseText,
                rawText: responseText
              }
            }
          } else {
            // Empty response body
            errorData = {
              error: 'empty_response',
              message: `Server returned empty response with status ${response.status}`
            }
          }
        } catch (e) {
          // If reading response fails
          console.error('Error reading response:', e)
          errorData = {
            error: 'read_error',
            message: `Failed to read response: ${e instanceof Error ? e.message : 'Unknown error'}`,
            status: response.status
          }
        }
        
        // If errorData is empty object or doesn't have message, provide default message
        if (Object.keys(errorData).length === 0 || (!errorData.message && !errorData.details && !errorData.error)) {
          // Try to use responseText as message if available
          if (responseText && responseText.trim()) {
            errorData = {
              error: 'parse_error',
              message: responseText,
              rawText: responseText
            }
          } else {
            errorData = {
              error: 'unknown_error',
              message: `HTTP error! status: ${response.status}. Response was empty.`,
              status: response.status
            }
          }
        }
        
        // Only log non-400 errors to avoid console noise
        if (response.status !== 400) {
          console.error('API Error Response (parsed):', errorData)
        }
        
        // Handle validation errors with details
        if (errorData.errors && typeof errorData.errors === 'object') {
          const validationMessages = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ')
          throw new Error(errorData.details || validationMessages || errorData.message || `Validation failed: ${validationMessages}`)
        }
        
        // Provide more specific error messages for common status codes
        let errorMessage = errorData.message || errorData.details || errorData.rawText
        if (!errorMessage) {
          switch (response.status) {
            case 400:
              errorMessage = 'Bad request. Please check your input data.'
              break
            case 401:
              errorMessage = 'Unauthorized. Please login again.'
              break
            case 403:
              errorMessage = 'Forbidden. You do not have permission to perform this action.'
              break
            case 404:
              errorMessage = 'Resource not found.'
              break
            case 405:
              errorMessage = 'Method not allowed. The server does not support this HTTP method. Please check if the endpoint is correct.'
              break
            case 500:
              errorMessage = 'Internal server error. Please try again later.'
              break
            default:
              errorMessage = `HTTP error! status: ${response.status}`
          }
        }
        
        // Create error object with message
        const error = new Error(errorMessage)
        // Add response status to error for better handling
        ;(error as any).status = response.status
        ;(error as any).isConflict = errorMessage.includes('đã có lịch hẹn') || 
                                      errorMessage.includes('trùng') || 
                                      errorMessage.includes('conflict')
        throw error
      }

      const jsonData = await response.json()
      console.log('API Response Data:', jsonData)
      return jsonData
    } catch (error: any) {
      // Don't log conflict errors (they are expected and handled)
      if (!error.isConflict) {
        console.error('API Request Error:', error)
      }
      
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

