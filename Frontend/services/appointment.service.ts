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
  patientPhoneNumber?: string;
  patientAddress?: string;
  doctorName?: string;
  doctorFullName?: string;
  doctorGender?: string;
  doctorTitle?: string;
  doctorPhoneNumber?: string;
  doctorWorkplace?: string;
  doctorSpecialties?: string; // Comma-separated string
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

  /**
   * Create a new appointment
   * @param appointmentData - Appointment data to create
   * @returns Created appointment
   */
  async createAppointment(appointmentData: {
    patientId: string;
    scheduledStart: string; // ISO 8601 date string
    scheduledEnd: string; // ISO 8601 date string
    title?: string;
    reason?: string;
    symptomsOns?: string;
    symptomsSever?: string;
    currentMedication?: string;
    notes?: string;
  }): Promise<Appointment> {
    try {
      const response: any = await apiClient.post('/api/v1/appointments', appointmentData);
      
      // Handle ResponseSuccess format: { status, message, data, timestamp }
      if (response.data) {
        return response.data as Appointment;
      }
      
      // Handle direct response
      if (response.id) {
        return response as Appointment;
      }
      
      throw new Error('Invalid response format from server');
    } catch (error: any) {
      // Extract error message from response
      let errorMessage = 'Không thể tạo lịch hẹn. Vui lòng thử lại.';
      
      // Error from api-client already has message extracted
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Check if this is a conflict error
      const isConflict = error.isConflict || 
                        errorMessage.includes('đã có lịch hẹn') || 
                        errorMessage.includes('trùng') || 
                        errorMessage.includes('conflict');
      
      // Only log non-conflict errors to avoid console noise
      if (!isConflict) {
        console.error('Error creating appointment:', error);
      }
      
      // Preserve conflict flag when re-throwing
      const newError = new Error(errorMessage);
      (newError as any).isConflict = isConflict;
      throw newError;
    }
  },

  /**
   * Get appointment by ID
   * @param appointmentId - Appointment ID
   * @returns Appointment details
   */
  async getAppointmentById(appointmentId: string): Promise<Appointment> {
    try {
      const response: any = await apiClient.get(`/api/v1/appointments/${appointmentId}`);
      
      if (response.success && response.data) {
        return response.data as Appointment;
      }
      
      throw new Error('Invalid response format from server');
    } catch (error: any) {
      console.error('Error fetching appointment:', error);
      
      // Extract error message from response
      let errorMessage = 'Không thể tải thông tin lịch hẹn. Vui lòng thử lại.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },
};

