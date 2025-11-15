/**
 * User Management Service
 * Handles all user management-related API calls for admin
 */

import { apiClient, type ApiResponse } from '@/lib/api-client'

export interface User {
  id: string
  email: string
  fullName: string
  phoneNumber: string
  gender?: string
  dateOfBirth?: string
  role: string // 'DOCTOR' | 'PATIENT' | 'ADMIN'
  status: string // 'ACTIVE' | 'PENDING' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  approvalRequestStatus?: string // 'PENDING' | 'APPROVED' | 'REJECTED' - only for doctors
}

export interface DoctorProfile {
  userId: string
  practiceLicenseNo?: string
  cccdNumber?: string
  title?: string
  workplaceName?: string
  facilityName?: string
  clinicAddress?: string
  careTarget?: string[]
  specialties?: string[]
  diseasesTreated?: string[]
  educationSummary?: string
  trainingInstitution?: string
  graduationYear?: number
  major?: string
  address?: string
  province?: string
}

export interface DoctorExperience {
  doctorId: string
  fromDate: string
  toDate: string
  organization: string
  location?: string
  specialty?: string[]
}

export interface ProfessionalInfoResponse {
  title: string
  province?: string
  facilityName: string
  careTarget: string[]
  specialties: string[]
  diseasesTreated: string[]
  languages: string[]
  practicingCertificationId: string
  workExperiences: WorkExperienceDto[]
  educations: EducationDto[]
  certifications: CertificationDto[]
}

export interface WorkExperienceDto {
  id: string
  position: string
  specialties: string[]
  clinicHospital: string
  location: string
  fromDate: string
  toDate: string
  isCurrentJob: boolean
}

export interface EducationDto {
  specialty: string
  qualification: string
  school: string
  fromYear: number
  toYear: number
}

export interface CertificationDto {
  name: string
  issuingOrganization: string
  issueDate?: string
  attachmentUrl?: string
}

export interface ApprovalRequest {
  userId: string
  type: string
  status: string // 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  note?: string
}

export interface UserDetails extends User {
  doctorProfile?: DoctorProfile
  doctorExperience?: DoctorExperience[]
  approvalRequest?: ApprovalRequest
}

export interface UsersResponse {
  content: User[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

class UserService {
  /**
   * Get all users with pagination and filtering
   */
  async getAllUsers(params: {
    page?: number
    size?: number
    roleName?: string
    status?: string
  } = {}): Promise<UsersResponse> {
    const { page = 1, size = 10, roleName, status } = params
    
    let queryParams = `page=${page}&size=${size}`
    if (roleName) {
      queryParams += `&roleName=${encodeURIComponent(roleName)}`
    }

    const response = await apiClient.get<ApiResponse<UsersResponse>>(
      `/api/v1/users?${queryParams}`
    )
    
    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch users')
    }

    const users = response.data as UsersResponse
    
    // Client-side filtering by status if provided
    if (status) {
      const filteredUsers = users.content.filter(user => user.status === status)
      return {
        ...users,
        content: filteredUsers,
        totalElements: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / size)
      }
    }

    return users
  }

  /**
   * Get user by ID with details
   */
  async getUserById(userId: string): Promise<UserDetails> {
    const response = await apiClient.get<ApiResponse<User>>(
      `/api/v1/users/${userId}`
    )
    
    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch user details')
    }

    return response.data as UserDetails
  }

  /**
   * Approve doctor account
   */
  async approveDoctor(userId: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/v1/auth/admin/approve-doctor/${userId}`
    )
    
    if (response.error) {
      throw new Error(response.error.message || 'Failed to approve doctor account')
    }
  }

  /**
   * Toggle user account status (activate/deactivate)
   */
  async toggleAccountStatus(userId: string, activate: boolean): Promise<void> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/v1/users/${userId}/toggle-status`,
      { activate }
    )
    
    if (response.error) {
      throw new Error(response.error.message || 'Failed to toggle account status')
    }
  }

  /**
   * Get professional information for current doctor
   */
  async getProfessionalInfo(): Promise<ProfessionalInfoResponse> {
    const endpoint = `/api/doctors/me/professional-info`
    console.log('Calling endpoint:', endpoint)
    
    try {
      const response = await apiClient.get<any>(endpoint)
      console.log('Response received:', response)
      
      // Backend returns ResponseSuccess format: { status, message, data, timestamp }
      // or ApiResponse format: { statusCode, message, data, error? }
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch professional information')
      }

      // Handle both ResponseSuccess and ApiResponse formats
      if (response.data) {
        return response.data as ProfessionalInfoResponse
      }
      
      // If response is the data directly (shouldn't happen but handle it)
      if (response.title || response.specialties) {
        return response as ProfessionalInfoResponse
      }

      throw new Error('Invalid response format from server')
    } catch (error: any) {
      console.error('Error in getProfessionalInfo:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        endpoint
      })
      throw error
    }
  }

  /**
   * Update professional information for current doctor
   */
  async updateProfessionalInfo(data: {
    title: string
    province?: string
    facilityName: string
    careForAdults: boolean
    careForChildren: boolean
    specialties: string[]
    diseasesTreated: string[]
    languages: string[]
    practicingCertificationId: string
    workExperiences?: Array<{
      id?: string
      position: string
      specialties: string[]
      clinicHospital: string
      location: string
      fromDate: string
      toDate?: string
      isCurrentJob?: boolean
    }>
  }): Promise<ProfessionalInfoResponse> {
    const endpoint = `/api/doctors/me/professional-info`
    console.log('Updating professional info:', data)
    
    try {
      // Use POST endpoint directly (more reliable than PUT)
      // Try alternative endpoints in order
      let response: any
      let lastError: any = null
      
      // Try endpoint 1: /me/update-professional-info (simplest path)
      try {
        const endpoint1 = `/api/doctors/me/update-professional-info`
        console.log('Trying POST endpoint 1:', endpoint1)
        response = await apiClient.post<any>(endpoint1, data)
        console.log('Update response received (POST endpoint 1):', response)
      } catch (error1: any) {
        console.log('Endpoint 1 failed:', error1.message)
        lastError = error1
        
        // Try endpoint 2: /me/professional-info/update
        try {
          const endpoint2 = `${endpoint}/update`
          console.log('Trying POST endpoint 2:', endpoint2)
          response = await apiClient.post<any>(endpoint2, data)
          console.log('Update response received (POST endpoint 2):', response)
        } catch (error2: any) {
          console.log('Endpoint 2 failed:', error2.message)
          lastError = error2
          
          // Try endpoint 3: PUT /me/professional-info (original)
          try {
            console.log('Trying PUT endpoint:', endpoint)
            response = await apiClient.put<any>(endpoint, data)
            console.log('Update response received (PUT):', response)
          } catch (error3: any) {
            console.log('All endpoints failed. Last error:', error3.message)
            throw error3
          }
        }
      }
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to update professional information')
      }

      // Handle both ResponseSuccess and ApiResponse formats
      if (response.data) {
        return response.data as ProfessionalInfoResponse
      }
      
      // If response is the data directly (shouldn't happen but handle it)
      if (response.title || response.specialties) {
        return response as ProfessionalInfoResponse
      }

      throw new Error('Invalid response format from server')
    } catch (error: any) {
      console.error('Error in updateProfessionalInfo:', error)
      
      // Extract meaningful error message
      let errorMessage = 'Failed to update professional information'
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details
      }
      
      console.error('Error details:', {
        message: errorMessage,
        originalError: error,
        endpoint
      })
      
      throw new Error(errorMessage)
    }
  }
}

export const userService = new UserService()

