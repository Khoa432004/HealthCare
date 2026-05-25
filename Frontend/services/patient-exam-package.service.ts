import { apiClient } from '@/lib/api-client'

export type PatientExamPackage = {
  packageId: string
  packageName: string
  durationDays: number
  priceVnd: number
  applicable: boolean
  sortOrder?: number
}

export type DoctorPackageInfo = {
  doctorId: string
  doctorName: string
  specialty: string
  title?: string
  rating?: number
  clinic?: string
  packages: PatientExamPackage[]
}

function unwrapData<T>(response: any): T {
  if (response?.error) {
    const backendMessage =
      (typeof response.message === 'string' && response.message) ||
      (typeof response.details === 'string' && response.details) ||
      (typeof response.error === 'string' && response.error) ||
      (typeof response.error?.message === 'string' && response.error.message) ||
      'Request failed'
    throw new Error(backendMessage)
  }
  if (response?.data !== undefined && response?.data !== null) {
    return response.data as T
  }
  return response as T
}

function normalizePackage(p: any): PatientExamPackage {
  return {
    packageId: p.packageId ?? '',
    packageName: p.packageName ?? '',
    durationDays: Number(p.durationDays ?? 7),
    priceVnd: Number(p.priceVnd ?? 0),
    applicable: Boolean(p.applicable),
    sortOrder: p.sortOrder,
  }
}

class PatientExamPackageService {
  /**
   * Get all available doctors for patient to browse packages
   */
  async getAllDoctors(searchQuery?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams()
      if (searchQuery?.trim()) {
        params.append('search', searchQuery.trim())
      }
      const endpoint = `/api/doctors/available${params.toString() ? `?${params.toString()}` : ''}`
      const response = await apiClient.get<any>(endpoint)
      const doctors = Array.isArray(response) ? response : response?.data || []
      return doctors
    } catch (error) {
      console.error('Error fetching doctors:', error)
      return []
    }
  }

  /**
   * Get doctor's details
   */
  async getDoctorDetail(doctorId: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/api/doctors/${doctorId}`)
      return response || {}
    } catch (error) {
      console.error(`Error fetching doctor details for ${doctorId}:`, error)
      throw error
    }
  }

  /**
   * Get exam packages for a specific doctor
   */
  async getDoctorExamPackages(doctorId: string): Promise<PatientExamPackage[]> {
    try {
      const response = await apiClient.get<any>(`/api/v1/doctors/me/exam-packages/${doctorId}`)
      const packages = Array.isArray(response) ? response : response?.data || []
      return packages.map(normalizePackage)
    } catch (error) {
      console.error(`Error fetching exam packages for doctor ${doctorId}:`, error)
      return []
    }
  }

  /**
   * Create appointment with package purchase
   * This will be used after patient selects a package
   */
  async purchasePackage(doctorId: string, packageId: string, patientId: string): Promise<any> {
    try {
      const body = {
        doctorId,
        packageId,
        patientId,
        purchaseDate: new Date().toISOString(),
      }
      const response = await apiClient.post('/api/v1/patient-packages/purchase', body)
      return unwrapData(response)
    } catch (error) {
      console.error('Error purchasing package:', error)
      throw error
    }
  }

  /**
   * Get patient's purchased packages
   */
  async getMyPackages(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/v1/patient-packages/my-packages')
      const raw = unwrapData(response) as any[]
      if (!Array.isArray(raw)) return []
      return raw.map(p => ({
        id: p.id ?? p.purchasedPackageId ?? p._id ?? '',
        packageId: p.packageId ?? '',
        packageName: p.packageName ?? p.package_name ?? '',
        doctorId: p.doctorId ?? p.doctor_id ?? '',
        doctorName: p.doctorName ?? p.doctor_name ?? p.doctorFullName ?? p.doctor?.name ?? '',
        doctorSpecialty: p.doctorSpecialty ?? p.doctor_specialty ?? p.specialty ?? p.doctor?.specialty ?? '',
        durationDays: Number(p.durationDays ?? p.duration_days ?? 0),
        priceVnd: Number(p.priceVnd ?? p.price_vnd ?? p.price ?? 0),
        purchaseDate: p.purchaseDate ?? p.purchase_date ?? p.createdAt ?? '',
        expirationDate: p.expirationDate ?? p.expiration_date ?? p.expiredAt ?? '',
        status: p.status ?? 'pending',
        remainingDays: Number(p.remainingDays ?? p.remaining_days ?? 0),
        messagesRemaining: Number(p.messagesRemaining ?? p.messages_remaining ?? 0),
        sessionsRemaining: Number(p.sessionsRemaining ?? p.sessions_remaining ?? 0),
      }))
    } catch (error) {
      console.error('Error fetching my packages:', error)
      return []
    }
  }
}

export const patientExamPackageService = new PatientExamPackageService()
