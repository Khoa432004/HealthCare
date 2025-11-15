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
}

export const userService = new UserService()

