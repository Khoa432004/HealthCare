import { apiClient, API_ENDPOINTS } from '@/lib/api-client';

export interface CanceledAppointment {
  appointmentId: string;
  scheduledStart: string;
  scheduledEnd: string;
  doctorName: string;
  patientName: string;
  patientPhone: string;
  cancellationReason: string;
  canceledAt: string;
  paymentStatus: string;
  appointmentStatus?: string;
  totalAmount: number | null;
  paymentId: string | null;
  canceledBy: string;
}

export interface CanceledAppointmentsResponse {
  content: CanceledAppointment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface RefundRequest {
  paymentId: string;
  appointmentId: string;
  refundReason?: string;
}

export const canceledAppointmentService = {
  async getCanceledAppointments(search?: string, page: number = 0, size: number = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    const response: any = await apiClient.get(
      `${API_ENDPOINTS.ADMIN.CANCELED_APPOINTMENTS}?${params.toString()}`
    );
    
    // Extract data from ResponseSuccess wrapper
    return response.data as CanceledAppointmentsResponse;
  },

  async processRefund(request: RefundRequest) {
    const response = await apiClient.post(
      `${API_ENDPOINTS.ADMIN.CANCELED_APPOINTMENTS}/refund`,
      request
    );
    return response;
  },
};

