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

export interface VitalMetricsRangeQuery {
  /** "week" | "month" | "year" — backend will compute the bounds from now(). */
  period?: "week" | "month" | "year"
  /** ISO-8601 string. Overrides the period-derived lower bound. */
  from?: string
  /** ISO-8601 string. Overrides the period-derived upper bound. */
  to?: string
}

class PatientVitalMetricsService {
  /**
   * Fetch the merged vital-metrics feed for a patient.
   *
   * Pass `range` to scope the response to a specific period / window. When
   * omitted, the full history is returned (legacy behavior preserved for
   * existing callers).
   */
  async getVitalMetrics(
    patientId: string,
    range?: VitalMetricsRangeQuery
  ): Promise<MedicalVitalMetricPoint[]> {
    const base =
      (API_ENDPOINTS as any).PATIENTS?.GET_VITAL_METRICS?.(patientId) ??
      `/api/medicalexaminationhistory/${patientId}/vital-metrics`

    const params = new URLSearchParams()
    if (range?.period) params.set("period", range.period)
    if (range?.from) params.set("from", range.from)
    if (range?.to) params.set("to", range.to)

    const endpoint = params.toString() ? `${base}?${params.toString()}` : base
    const response = await apiClient.get<MedicalVitalMetricPoint[]>(endpoint)

    if (Array.isArray(response)) return response

    const wrapped = response as unknown as { data?: MedicalVitalMetricPoint[] }
    return wrapped?.data ?? []
  }
}

export const patientVitalMetricsService = new PatientVitalMetricsService()
