/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Get base URL from environment variable or use default
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REGISTER_PERSONAL: '/api/auth/register/personal-info',
    REGISTER_PROFESSIONAL: '/api/auth/register/professional-info',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh',
    CHANGE_PASSWORD: '/api/auth/change-password',
    CHANGE_PASSWORD_FIRST_LOGIN: '/api/auth/change-password-first-login',
    FORGET_PASSWORD: '/api/auth/forget-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  USER: {
    GET_ALL: '/api/users',
    GET_BY_ID: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
  },
  DASHBOARD: {
    GET_STATS: '/api/v1/dashboard/stats',
  },
} as const

// Token storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  USER_ROLE: 'user_role',
} as const

