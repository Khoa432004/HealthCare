import { apiClient } from '@/lib/api-client';

export interface VitalSign {
  signType: string;
  value: string;
  unit: string;
}

export interface Medication {
  medicationName: string;
  dosage: string;
  medicationType: string;
  mealRelation: string; // before-meal, with-food, after-meal, anytime
  durationDays?: number;
  startDate?: string;
  note?: string;
}

export interface MedicalReport {
  id?: string;
  appointmentId: string;
  doctorId?: string;
  status?: 'draft' | 'completed';
  clinic?: string;
  province?: string;
  chronicConditions?: string;
  illness?: string;
  medicalExam?: string;
  icdCode?: string;
  diagnosis?: string;
  coverage?: string;
  recommendation?: string;
  note?: string;
  followUpDate?: string;
  vitalSigns?: VitalSign[];
  medications?: Medication[];
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface CreateMedicalReportRequest {
  appointmentId: string;
  clinic?: string;
  province?: string;
  chronicConditions?: string;
  illness?: string;
  medicalExam?: string;
  icdCode?: string;
  diagnosis?: string;
  coverage?: string;
  recommendation?: string;
  note?: string;
  followUpDate?: string;
  vitalSigns?: VitalSign[];
  medications?: Medication[];
}

export const medicalReportService = {
  /**
   * Save medical report as draft
   * @param request - Medical report data
   * @returns Saved medical report
   */
  async saveDraft(request: CreateMedicalReportRequest): Promise<MedicalReport> {
    try {
      const response: any = await apiClient.post('/api/v1/medical-reports/draft', request);
      
      if (response.success && response.data) {
        return response.data as MedicalReport;
      }
      
      throw new Error('Invalid response format from server');
    } catch (error: any) {
      console.error('Error saving medical report as draft:', error);
      
      let errorMessage = 'Không thể lưu báo cáo y tế. Vui lòng thử lại.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Complete medical report (status = COMPLETED)
   * @param request - Medical report data
   * @returns Completed medical report
   */
  async completeReport(request: CreateMedicalReportRequest): Promise<MedicalReport> {
    try {
      const response: any = await apiClient.post('/api/v1/medical-reports/complete', request);
      
      if (response.success && response.data) {
        return response.data as MedicalReport;
      }
      
      throw new Error('Invalid response format from server');
    } catch (error: any) {
      console.error('Error completing medical report:', error);
      
      let errorMessage = 'Không thể hoàn thành báo cáo y tế. Vui lòng thử lại.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Get medical report by appointment ID
   * @param appointmentId - Appointment ID
   * @returns Medical report or null if not found
   */
  async getByAppointmentId(appointmentId: string): Promise<MedicalReport | null> {
    try {
      const response: any = await apiClient.get(`/api/v1/medical-reports/appointment/${appointmentId}`);
      
      if (response.success) {
        // Handle case where data is null (no report found)
        if (response.data === null || response.data === undefined) {
          return null;
        }
        return response.data as MedicalReport;
      }
      
      // If success is false but no error thrown, return null
      console.warn('Medical report API returned success=false:', response);
      return null;
    } catch (error: any) {
      console.error('Error fetching medical report for appointment:', appointmentId, error);
      
      // If it's a 404 or "not found" error, return null (no report exists)
      if (error.response?.status === 404 || 
          error.message?.toLowerCase().includes('not found') ||
          error.message?.toLowerCase().includes('no medical report')) {
        return null;
      }
      
      // For other errors, re-throw to let the caller handle it
      throw error;
    }
  },
};

