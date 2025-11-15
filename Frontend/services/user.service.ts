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

export interface WorkScheduleResponse {
  sessionDuration: number
  appointmentCost: number
  days: DayScheduleResponse[]
}

export interface DayScheduleResponse {
  weekday: number // 1 = Monday, 7 = Sunday
  enabled: boolean
  timeSlots: TimeSlotResponse[]
}

export interface TimeSlotResponse {
  startTime: string // HH:mm
  endTime: string // HH:mm
}

export interface UpdateWorkScheduleRequest {
  sessionDuration: number
  appointmentCost: number
  days: DayScheduleRequest[]
}

export interface DayScheduleRequest {
  weekday: number
  enabled: boolean
  timeSlots: TimeSlotRequest[]
}

export interface TimeSlotRequest {
  startTime: string
  endTime: string
}

export interface PersonalInfoDetailResponse {
  userId: string
  email: string
  fullName: string
  phoneNumber: string
  cccdNumber?: string
  dateOfBirth: string
  gender: string
  address?: string
}

export interface UpdatePersonalInfoRequest {
  fullName: string
  phoneNumber: string
  email: string
  dateOfBirth: string
  gender: string
  address?: string
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

  /**
   * Get work schedule for current doctor
   */
  async getWorkSchedule(): Promise<WorkScheduleResponse> {
    const endpoint = `/api/doctors/me/work-schedule`
    console.log('Getting work schedule from:', endpoint)
    
    try {
      const response = await apiClient.get<any>(endpoint)
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch work schedule')
      }

      // Handle ResponseSuccess format: { status, message, data, timestamp }
      if (response.data) {
        return response.data as WorkScheduleResponse
      }

      throw new Error('Invalid response format from server')
    } catch (error: any) {
      console.error('Error in getWorkSchedule:', error)
      throw error
    }
  }

  /**
   * Update work schedule for current doctor
   */
  async updateWorkSchedule(data: UpdateWorkScheduleRequest): Promise<WorkScheduleResponse> {
    const endpoint = `/api/doctors/me/work-schedule`
    console.log('Updating work schedule:', data)
    
    try {
      let response: any
      
      // Try PUT first, then POST
      try {
        response = await apiClient.put<any>(endpoint, data)
      } catch (putError: any) {
        console.log('PUT failed, trying POST:', putError.message)
        response = await apiClient.post<any>(endpoint, data)
      }
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to update work schedule')
      }

      // Handle ResponseSuccess format: { status, message, data, timestamp }
      if (response.data) {
        return response.data as WorkScheduleResponse
      }

      throw new Error('Invalid response format from server')
    } catch (error: any) {
      console.error('Error in updateWorkSchedule:', error)
      
      let errorMessage = 'Failed to update work schedule'
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      throw new Error(errorMessage)
    }
  }

  /**
   * Get personal information for current doctor
   */
  async getPersonalInfo(): Promise<PersonalInfoDetailResponse> {
    const endpoint = `/api/doctors/me/personal-info`
    console.log('Getting personal info from:', endpoint)
    
    try {
      const response = await apiClient.get<any>(endpoint)
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch personal information')
      }

      if (response.data) {
        return response.data as PersonalInfoDetailResponse
      }

      throw new Error('Invalid response format from server')
    } catch (error: any) {
      console.error('Error in getPersonalInfo:', error)
      throw error
    }
  }

  /**
   * Update personal information for current doctor
   */
  async updatePersonalInfo(data: UpdatePersonalInfoRequest): Promise<PersonalInfoDetailResponse> {
    const endpoint = `/api/doctors/me/personal-info`
    console.log('Updating personal info:', data)
    
    try {
      let response: any
      
      // Try PUT first, then POST
      try {
        response = await apiClient.put<any>(endpoint, data)
      } catch (putError: any) {
        console.log('PUT failed, trying POST:', putError.message)
        response = await apiClient.post<any>(endpoint, data)
      }
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to update personal information')
      }

      if (response.data) {
        return response.data as PersonalInfoDetailResponse
      }

      throw new Error('Invalid response format from server')
    } catch (error: any) {
      console.error('Error in updatePersonalInfo:', error)
      
      let errorMessage = 'Failed to update personal information'
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      throw new Error(errorMessage)
    }
  }

  /**
   * Get personal information for current patient
   */
  async getPatientPersonalInfo(): Promise<PersonalInfoDetailResponse> {
    const endpoint = `/api/patients/me/personal-info`
    console.log('Calling endpoint:', endpoint)
    
    try {
      const response = await apiClient.get<any>(endpoint)
      console.log('Response received:', response)
      
      // Backend returns ResponseSuccess format: { status, message, data, timestamp }
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch personal information')
      }

      // Handle ResponseSuccess format
      if (response.data) {
        return response.data as PersonalInfoDetailResponse
      }
      
      throw new Error('Invalid response format from server')
    } catch (error: any) {
      console.error('Error in getPatientPersonalInfo:', error)
      throw error
    }
  }

  /**
   * Update personal information for current patient
   */
  async updatePatientPersonalInfo(data: UpdatePersonalInfoRequest): Promise<PersonalInfoDetailResponse> {
    const endpoint = `/api/patients/me/personal-info`
    console.log('Calling endpoint:', endpoint)
    console.log('Request data:', data)
    
    try {
      let response: any
      
      // Try PUT first, then POST
      try {
        response = await apiClient.put<any>(endpoint, data)
      } catch (putError: any) {
        console.log('PUT failed, trying POST:', putError.message)
        response = await apiClient.post<any>(endpoint, data)
      }
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to update personal information')
      }

      // Handle ResponseSuccess format
      if (response.data) {
        return response.data as PersonalInfoDetailResponse
      }
      
      throw new Error('Invalid response format from server')
    } catch (error: any) {
      console.error('Error in updatePatientPersonalInfo:', error)
      
      let errorMessage = 'Failed to update personal information'
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      throw new Error(errorMessage)
    }
  }
}

export const userService = new UserService()

