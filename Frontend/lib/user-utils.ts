/**
 * User Utility Functions
 * Helper functions for user-related operations
 */

import { authService } from '@/services/auth.service'

/**
 * Get user information from authentication service
 */
export function getUserInfo() {
  return authService.getUserInfo()
}

/**
 * Get initials from fullName
 * @param name - Full name string
 * @param fallback - Fallback initials if name is empty
 * @returns Initials string (e.g., "Nguyễn Văn A" -> "NA")
 */
export function getInitials(name: string | null | undefined, fallback: string = 'US'): string {
  if (!name || name.trim() === '') return fallback
  
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    // Take first letter of first name and first letter of last name
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  
  // If only one name, take first 2 letters
  return name.substring(0, 2).toUpperCase()
}

/**
 * Get role display name in Vietnamese
 * @param role - User role (ADMIN, DOCTOR, PATIENT, etc.)
 * @returns Display name in Vietnamese
 */
export function getRoleDisplayName(role: string | null | undefined): string {
  if (!role) return 'Người dùng'
  
  const roleMap: Record<string, string> = {
    ADMIN: 'Quản trị viên',
    CLINIC_ADMIN: 'Quản trị phòng khám',
    DOCTOR: 'Bác sĩ',
    PATIENT: 'Bệnh nhân',
  }
  
  return roleMap[role.toUpperCase()] || 'Người dùng'
}

/**
 * Hook to get user info with state management
 * @returns User info state and loading state
 */
export function useUserInfo() {
  const user = getUserInfo()
  
  return {
    userInfo: user ? {
      fullName: user.fullName || '',
      role: user.role || '',
      email: user.email || '',
      id: user.id || '',
    } : null,
    isLoading: false,
  }
}

