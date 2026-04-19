/**
 * Patient Vital Metrics service.
 *
 * Backend endpoint:
 *   GET /api/medicalexaminationhistory/{patientId}/vital-metrics
 *   Response: MedicalVitalMetricPoint[]
 *
 * The backend merges vital signs recorded in COMPLETED medical reports with
 * self-reported measurements captured by the "Add Measurement" popup, ordered
 * by time asc. Blood pressure is emitted as "systolic/diastolic" in one point;
 * when a BP reading is bundled with a pulse the backend emits a separate
 * "Heart rate" point so the chart can render both.
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api-config'

export interface MedicalVitalMetricPoint {
  measuredAt: string // ISO date-time string
  appointmentId: string
  signType: string
  value: string
  unit: string
  /** Optional enrichment fields populated for self-reported measurements. */
  source?: 'MANUAL' | 'DEVICE'
  subType?: string
  badge?: 'LOW' | 'NORMAL' | 'HIGH'
  rangeLabel?: string
  meal?: 'BEFORE_MEAL' | 'AFTER_MEAL'
}

class PatientVitalMetricsService {
  async getVitalMetrics(patientId: string): Promise<MedicalVitalMetricPoint[]> {
    const endpoint =
      (API_ENDPOINTS as any).PATIENTS?.GET_VITAL_METRICS?.(patientId) ??
      `/api/medicalexaminationhistory/${patientId}/vital-metrics`

    const response = await apiClient.get<MedicalVitalMetricPoint[]>(endpoint)

    if (Array.isArray(response)) {
      return response
    }

    const wrapped = response as unknown as { data?: MedicalVitalMetricPoint[] }
    return wrapped?.data ?? []
  }
}

export const patientVitalMetricsService = new PatientVitalMetricsService()
