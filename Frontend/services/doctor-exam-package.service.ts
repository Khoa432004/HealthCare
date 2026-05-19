import { apiClient } from '@/lib/api-client'

export type DoctorExamPackageRow = {
  packageId: string | null
  packageName: string
  durationMinutes: number
  priceVnd: number
  applicable: boolean
  sortOrder?: number
}

export type PendingSubmission = {
  requestId: string
  submittedAt: string
  packages: DoctorExamPackageRow[]
}

export type ExamPackageWorkspace = {
  approvedPackages: DoctorExamPackageRow[]
  /** Each submit creates a new pending row; multiple can queue until admin acts. */
  pendingSubmissions: PendingSubmission[]
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

function normalizeRow(p: any): DoctorExamPackageRow {
  return {
    packageId: p.packageId ?? null,
    packageName: p.packageName ?? '',
    durationMinutes: Number(p.durationMinutes ?? 30),
    priceVnd: Number(p.priceVnd ?? 0),
    applicable: Boolean(p.applicable),
    sortOrder: p.sortOrder,
  }
}

function normalizeWorkspace(raw: any): ExamPackageWorkspace {
  const approved = (raw.approvedPackages ?? []).map(normalizeRow)
  const pendingRaw = raw.pendingSubmissions ?? raw.pendingSubmission
  let pendingSubmissions: PendingSubmission[] = []
  if (Array.isArray(pendingRaw)) {
    pendingSubmissions = pendingRaw.map((ps: any) => ({
      requestId: ps.requestId,
      submittedAt: ps.submittedAt,
      packages: (ps.packages ?? []).map(normalizeRow),
    }))
  } else if (pendingRaw && typeof pendingRaw === 'object') {
    pendingSubmissions = [
      {
        requestId: pendingRaw.requestId,
        submittedAt: pendingRaw.submittedAt,
        packages: (pendingRaw.packages ?? []).map(normalizeRow),
      },
    ]
  }
  return { approvedPackages: approved, pendingSubmissions }
}

class DoctorExamPackageService {
  async getWorkspace(): Promise<ExamPackageWorkspace> {
    const response = await apiClient.get<any>('/api/v1/doctors/me/exam-packages')
    const data = unwrapData<any>(response)
    return normalizeWorkspace(data)
  }

  async submitPackages(packages: DoctorExamPackageRow[]): Promise<ExamPackageWorkspace> {
    const body = {
      packages: packages.map((p) => ({
        packageId: p.packageId || null,
        packageName: p.packageName.trim(),
        durationMinutes: p.durationMinutes,
        priceVnd: p.priceVnd,
        applicable: p.applicable,
      })),
    }
    const response = await apiClient.post<any>('/api/v1/doctors/me/exam-packages/submit', body)
    const data = unwrapData<any>(response)
    return normalizeWorkspace(data)
  }
}

export const doctorExamPackageService = new DoctorExamPackageService()
