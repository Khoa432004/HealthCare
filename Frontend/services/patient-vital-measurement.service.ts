/**
 * Patient Vital Measurement service.
 *
 * Persists self-reported measurements captured by the "Add Measurement" popup
 * via:
 *   POST /api/patient-vital-measurements
 *
 * The payload mirrors the `CreateVitalMeasurementRequest` DTO on the backend.
 * Classification (badge + reference range label) is computed server-side using
 * the same thresholds as the ysalus-source popup, so the frontend only has to
 * send the raw values.
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api-config'

export type MeasurementMetricType =
  | 'BLOOD_PRESSURE'
  | 'BLOOD_SUGAR'
  | 'CHOLESTEROL'
  | 'HEART_RATE'
  | 'HEMATOCRIT'
  | 'HEMOGLOBIN'
  | 'KETONE'
  | 'URIC_ACID'

export type MeasurementSubType =
  | 'BLOOD_GLUCOSE'
  | 'TOTAL_CHOLESTEROL'
  | 'HIGH_DENSITY_LIPOPROTEIN'
  | 'LOW_DENSITY_LIPOPROTEIN'
  | 'TRIGLYCERIDES'

export type MeasurementSource = 'MANUAL' | 'DEVICE'
export type MealContext = 'BEFORE_MEAL' | 'AFTER_MEAL'
export type MeasurementBadge = 'LOW' | 'NORMAL' | 'HIGH'

export interface CreateVitalMeasurementRequest {
  metricType: MeasurementMetricType
  metricSubType?: MeasurementSubType
  source?: MeasurementSource
  systolicValue?: number
  diastolicValue?: number
  pulseValue?: number
  numericValue?: number
  unit?: string
  meal?: MealContext
  notes?: string
  takenAt?: string // ISO 8601
}

export interface VitalMeasurementResponse {
  id: string
  patientId: string
  metricType: MeasurementMetricType
  metricSubType?: MeasurementSubType
  source: MeasurementSource
  systolicValue?: number
  diastolicValue?: number
  pulseValue?: number
  numericValue?: number
  unit?: string
  meal?: MealContext
  notes?: string
  badge?: MeasurementBadge
  pulseBadge?: MeasurementBadge
  referenceRangeLabel?: string
  takenAt: string
  createdAt: string
  updatedAt: string
}

class PatientVitalMeasurementService {
  async create(
    payload: CreateVitalMeasurementRequest,
  ): Promise<VitalMeasurementResponse> {
    const endpoint =
      (API_ENDPOINTS as any).PATIENT_VITAL_MEASUREMENTS?.CREATE ??
      '/api/patient-vital-measurements'

    const response = await apiClient.post<
      | VitalMeasurementResponse
      | { data?: VitalMeasurementResponse }
      | { status: number; message: string; data: VitalMeasurementResponse }
    >(endpoint, payload)

    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: VitalMeasurementResponse }).data
    }
    return response as VitalMeasurementResponse
  }
}

export const patientVitalMeasurementService = new PatientVitalMeasurementService()
