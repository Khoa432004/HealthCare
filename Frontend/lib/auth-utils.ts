/**
 * Authentication Utilities
 * Helper functions for authentication and authorization
 */

import { STORAGE_KEYS } from './api-config'

/**
 * Set authentication cookies
 * This helps the middleware access the token
 */
export function setAuthCookies(accessToken: string, userRole: string): void {
  if (typeof window === 'undefined') return

  // Set cookies for middleware to access
  document.cookie = `access_token=${accessToken}; path=/; max-age=86400; SameSite=Strict`
  document.cookie = `user_role=${userRole}; path=/; max-age=86400; SameSite=Strict`
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(): void {
  if (typeof window === 'undefined') return

  // Clear cookies
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
}

/**
 * Get user role from localStorage
 */
export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.USER_ROLE)
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

/**
 * Check if user has required role
 */
export function hasRole(requiredRoles: string[]): boolean {
  const userRole = getUserRole()
  if (!userRole) return false
  return requiredRoles.includes(userRole.toUpperCase())
}

/**
 * Get redirect URL after login
 */
export function getRedirectUrl(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('redirect')
}

