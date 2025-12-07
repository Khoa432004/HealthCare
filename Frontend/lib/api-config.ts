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
  ADMIN: {
    APPROVE_DOCTOR: (userId: string) => `/api/auth/admin/approve-doctor/${userId}`,
    TOGGLE_ACCOUNT_STATUS: (userId: string) => `/api/v1/users/${userId}/toggle-status`,
    CANCELED_APPOINTMENTS: '/api/v1/admin/canceled-appointments',
    PAYROLL: '/api/v1/admin/payroll',
  },
  NOTIFICATIONS: {
    BASE: '/api/v1/notifications',
    BY_ID: (id: string) => `/api/v1/notifications/${id}`,
    USER: (userId: string) => `/api/v1/notifications/user/${userId}`,
  },
  APPOINTMENTS: {
    MY_APPOINTMENTS: '/api/v1/appointments/my-appointments',
    CREATE: '/api/v1/appointments',
    BY_ID: (id: string) => `/api/v1/appointments/${id}`,
  },
  DOCTORS: {
    GET_ALL: '/api/doctors',
    GET_BY_ID: (id: string) => `/api/doctors/${id}`,
  },
  PATIENTS:{
    GET_MEDICAL_HISTORY: (patientId: string) => `/api/medicalexaminationhistory/${patientId}`,
    GET_MEDICAL_HISTORY_DETAIL: (appointmentId: string) => `/api/medicalexaminationhistory/detail/${appointmentId}`,
    POST_PAYMENT: (orderTotal: number,orderInfo: string) => `/api/v1/vnpay/submitOrder?orderTotal=${orderTotal}&orderInfo=${encodeURIComponent(orderInfo)}`,

  },
  MEDICAL_EXAMINATION_HISTORY: {
    GET_BY_PATIENT: (patientId: string) => `/api/medicalExaminationHistory/medicalexaminationhistory/${patientId}`,
  },
  VNPAY: {
    PAYMENT: (orderTotal: number, orderInfo: string)  => `/api/v1/vnpay/submitOrder?orderTotal=${orderTotal}&orderInfo=${encodeURIComponent(orderInfo)}`,
  }

} as const

// Token storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  USER_ROLE: 'user_role',
} as const

