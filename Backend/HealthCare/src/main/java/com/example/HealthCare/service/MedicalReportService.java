package com.example.HealthCare.service;

import java.util.UUID;

import com.example.HealthCare.dto.request.CreateMedicalReportRequest;
import com.example.HealthCare.dto.response.MedicalReportResponse;

public interface MedicalReportService {
    /**
     * Save medical report as draft
     * @param request - Medical report data
     * @param doctorId - ID of the doctor creating the report
     * @return Saved medical report response
     */
    MedicalReportResponse saveDraft(CreateMedicalReportRequest request, UUID doctorId);
    
    /**
     * Complete medical report (status = COMPLETED)
     * Validates required fields and updates appointment status to COMPLETED
     * @param request - Medical report data
     * @param doctorId - ID of the doctor completing the report
     * @return Completed medical report response
     */
    MedicalReportResponse completeReport(CreateMedicalReportRequest request, UUID doctorId);
    
    /**
     * Get medical report by appointment ID
     * @param appointmentId - Appointment ID
     * @return Medical report response or null if not found
     */
    MedicalReportResponse getByAppointmentId(UUID appointmentId, UUID currentUserId);
}

