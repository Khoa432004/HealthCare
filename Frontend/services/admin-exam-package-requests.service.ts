import { apiClient } from '@/lib/api-client'

export type PendingExamPackageRequestItem = {
  requestId: string
  doctorUserId: string
  doctorName: string
  doctorEmail: string
  submittedAt: string
  packageLineCount: number
}

export type ExamPackageRow = {
  packageId: string | null
  packageName: string
  durationDays: number
  priceVnd: number
  applicable: boolean
  sortOrder?: number
}

export type ExamPackageChangeRow = {
  changeType: 'ADDED' | 'MODIFIED' | 'REMOVED'
  previous: ExamPackageRow | null
  proposed: ExamPackageRow | null
}

export type ExamPackageRequestDetail = {
  requestId: string
  doctorUserId: string
  doctorName: string
  doctorEmail: string
  submittedAt: string
  changes: ExamPackageChangeRow[]
  unchangedPublishedCount: number
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

class AdminExamPackageRequestsService {
  async listPending(): Promise<PendingExamPackageRequestItem[]> {
    const response = await apiClient.get<any>('/api/v1/admin/exam-package-requests/pending')
    const data = unwrapData<PendingExamPackageRequestItem[]>(response)
    return Array.isArray(data) ? data : []
  }

  async getPendingDetail(requestId: string): Promise<ExamPackageRequestDetail> {
    const response = await apiClient.get<any>(`/api/v1/admin/exam-package-requests/detail/${requestId}`)
    return unwrapData<ExamPackageRequestDetail>(response)
  }

  async approve(requestId: string): Promise<void> {
    await apiClient.post(`/api/v1/admin/exam-package-requests/${requestId}/approve`, {})
  }

  async reject(requestId: string, note?: string): Promise<void> {
    await apiClient.post(`/api/v1/admin/exam-package-requests/${requestId}/reject`, {
      note: note?.trim() || undefined,
    })
  }
}

export const adminExamPackageRequestsService = new AdminExamPackageRequestsService()
