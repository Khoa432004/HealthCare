import { apiClient, API_ENDPOINTS } from '@/lib/api-client';

export interface DoctorPayroll {
  doctorId: string;
  doctorName: string;
  email: string;
  phoneNumber: string;
  completedAppointments: number;
  totalRevenue: number;
  refunds: number;
  platformFee: number;
  doctorSalary: number;
  paymentStatus: string;
  payrollId: string | null;
  canSettle: boolean;
}

export interface PayrollFilterRequest {
  year: number;
  month: number;
  search?: string;
}

export interface SettlePayrollRequest {
  doctorId: string;
  year: number;
  month: number;
  note?: string;
}

export const payrollService = {
  async getDoctorPayrolls(year: number, month: number, search?: string): Promise<DoctorPayroll[]> {
    const params = new URLSearchParams({
      year: year.toString(),
      month: month.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    const response: any = await apiClient.get(
      `${API_ENDPOINTS.ADMIN.PAYROLL}?${params.toString()}`
    );
    
    // Extract data from ResponseSuccess wrapper
    return response.data as DoctorPayroll[];
  },

  async settlePayroll(request: SettlePayrollRequest): Promise<void> {
    await apiClient.post(
      `${API_ENDPOINTS.ADMIN.PAYROLL}/settle`,
      request
    );
  },
};

