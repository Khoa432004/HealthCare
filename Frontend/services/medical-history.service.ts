import { apiClient, type ApiResponse } from '@/lib/api-client';

export interface MedicalExaminationHistorySummaryDto {
    id: string; // appointment id
    patientId: string;
    doctor: string;
    date: string; // datetime
    reason: string;
    clinic: string;
    diagnosis?: string;
    notes?: string;
    completedAt?: string;
}

export interface MedicalReportVitalSignDto {
    signType: string;
    value: string;
    unit: string;
}

export interface Prescription {
    name: string;
    dosage: string;
    medicationType: string;
    mealRelation: string;
    duration: number;
    startDay: string;
    note: string;
}

export interface MedicalExaminationHistoryDetailDto {
    id: string; // appointment id
    patientId: string;
    doctor: string;
    clinic: string;
    doctorMajor: string;
    date: string;
    timeIn: string;
    timeOut: string;
    patientName: string;
    gender: string;
    birthDateTime: string;
    reason: string;
    diagnosis: string;
    clinicalDiagnosis: MedicalReportVitalSignDto[];
    treatment: string;
    notes: string;
    prescriptions: Prescription[];
}

class MedicalHistoryService {
    /**
     * Get medical examination history for a patient
     */
    async getHistory(patientId: string): Promise<MedicalExaminationHistorySummaryDto[]> {
        const response = await apiClient.get<MedicalExaminationHistorySummaryDto[]>(
            `/api/medicalexaminationhistory/${patientId}`
        );

        // The backend returns a List directly in the ResponseEntity body
        // apiClient.get might wrap it or return it directly depending on implementation
        // Based on other services, it seems to return the data directly if successful or wrapped in ApiResponse

        // Let's assume standard handling similar to other services
        if ((response as any).error) {
            throw new Error((response as any).error.message || 'Failed to fetch medical history');
        }

        // If it returns array directly
        if (Array.isArray(response)) {
            return response;
        }

        // If wrapped in success/data (though backend controller seems to return list directly)
        // Adjusting based on backend controller code: return ResponseEntity.ok(history);
        // It likely returns the JSON array directly.

        return response as unknown as MedicalExaminationHistorySummaryDto[];
    }

    /**
     * Get detailed history for a specific appointment
     */
    async getDetailHistory(appointmentId: string): Promise<MedicalExaminationHistoryDetailDto[]> {
        const response = await apiClient.get<MedicalExaminationHistoryDetailDto[]>(
            `/api/medicalexaminationhistory/detail/${appointmentId}`
        );

        if ((response as any).error) {
            throw new Error((response as any).error.message || 'Failed to fetch detail history');
        }

        if (Array.isArray(response)) {
            return response;
        }

        return response as unknown as MedicalExaminationHistoryDetailDto[];
    }
}

export const medicalHistoryService = new MedicalHistoryService();
