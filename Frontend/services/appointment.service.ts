import { apiClient } from '@/lib/api-client';

export type AppointmentStatus = 'SCHEDULED' | 'CANCELED' | 'COMPLETED' | 'IN_PROCESS';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  status: AppointmentStatus;
  scheduledStart: string; // ISO 8601 date string
  scheduledEnd: string; // ISO 8601 date string
  title?: string | null;
  reason?: string | null;
  symptomsOns?: string | null;
  symptomsSever?: string | null;
  currentMedication?: string | null;
  notes?: string | null;
  // Related user info
  patientName?: string;
  patientFullName?: string;
  patientGender?: string;
  doctorName?: string;
  doctorFullName?: string;
  doctorGender?: string;
}

export interface AppointmentResponse {
  success: boolean;
  data?: Appointment[];
  message?: string;
}

export const appointmentService = {
  /**
   * Get appointments for current user (doctor or patient)
   * @param startDate - Start date for filtering (ISO string)
   * @param endDate - End date for filtering (ISO string)
   */
  async getMyAppointments(startDate?: string, endDate?: string): Promise<Appointment[]> {
    try {
      let url = '/api/v1/appointments/my-appointments';
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response: any = await apiClient.get(url);
      
      if (response.success && response.data) {
        return response.data as Appointment[];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },

  /**
   * Get appointments for a specific date range
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   */
  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    return this.getMyAppointments(startDate, endDate);
  },
};

