/**
 * Patient Vital Metrics service.
 *
 * Backend contract (to be implemented):
 *   GET /api/medicalexaminationhistory/{patientId}/vital-metrics
 *   Response: MedicalVitalMetricPoint[]
 *
 * The backend collects every vital sign recorded in COMPLETED medical reports
 * of the patient's COMPLETED appointments and returns them ordered by time asc.
 * Blood pressure is stored as "SYS/DIA" (e.g. "120/80") in a single row.
 *
 * While the backend is not wired up yet, this service returns mock data so the
 * UI can be reviewed. Flip USE_MOCK to false once the endpoint is live.
 */

import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/api-config'

export interface MedicalVitalMetricPoint {
  measuredAt: string // ISO date-time string
  appointmentId: string
  signType: string
  value: string
  unit: string
}

const USE_MOCK = true

function buildMockData(): MedicalVitalMetricPoint[] {
  const now = new Date()
  const daysAgo = (d: number) => {
    const x = new Date(now)
    x.setDate(x.getDate() - d)
    x.setHours(9, 30, 0, 0)
    return x.toISOString()
  }

  const points: MedicalVitalMetricPoint[] = []
  const visits = [
    {
      d: 45,
      apt: 'mock-apt-1',
      samples: [
        ['Temperature', '36.8', '°C'],
        ['Blood pressure', '132/88', 'mmHg'],
        ['Heart rate', '82', 'bpm'],
        ['SpO₂', '97', '%'],
        ['Weight', '72.0', 'kg'],
      ],
    },
    {
      d: 30,
      apt: 'mock-apt-2',
      samples: [
        ['Temperature', '37.1', '°C'],
        ['Blood pressure', '128/84', 'mmHg'],
        ['Heart rate', '78', 'bpm'],
        ['Blood glucose', '118', 'mg/dL'],
        ['SpO₂', '98', '%'],
        ['Weight', '71.2', 'kg'],
      ],
    },
    {
      d: 14,
      apt: 'mock-apt-3',
      samples: [
        ['Temperature', '36.6', '°C'],
        ['Blood pressure', '124/80', 'mmHg'],
        ['Heart rate', '74', 'bpm'],
        ['SpO₂', '99', '%'],
        ['Respiratory rate', '16', 'breaths/min'],
        ['Weight', '70.8', 'kg'],
      ],
    },
    {
      d: 5,
      apt: 'mock-apt-4',
      samples: [
        ['Temperature', '36.7', '°C'],
        ['Blood pressure', '120/78', 'mmHg'],
        ['Heart rate', '72', 'bpm'],
        ['Blood glucose', '104', 'mg/dL'],
        ['Cholesterol', '190', 'mg/dL'],
        ['SpO₂', '99', '%'],
        ['Weight', '70.5', 'kg'],
      ],
    },
  ]

  for (const visit of visits) {
    for (const [signType, value, unit] of visit.samples) {
      points.push({
        measuredAt: daysAgo(visit.d),
        appointmentId: visit.apt,
        signType,
        value,
        unit,
      })
    }
  }

  return points.sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
  )
}

class PatientVitalMetricsService {
  async getVitalMetrics(patientId: string): Promise<MedicalVitalMetricPoint[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 250))
      return buildMockData()
    }

    // Will be enabled once backend endpoint is merged.
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
