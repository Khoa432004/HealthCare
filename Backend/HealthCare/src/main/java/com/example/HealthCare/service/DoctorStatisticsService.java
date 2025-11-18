package com.example.HealthCare.service;

import java.util.UUID;

import com.example.HealthCare.dto.request.DoctorStatisticsFilterRequest;
import com.example.HealthCare.dto.response.DoctorStatisticsResponse;

public interface DoctorStatisticsService {
    /**
     * Get statistics for a doctor based on filter criteria
     * @param doctorId - ID of the doctor
     * @param filter - Filter criteria (time period, facility, etc.)
     * @return DoctorStatisticsResponse with KPIs and pending reports
     */
    DoctorStatisticsResponse getDoctorStatistics(UUID doctorId, DoctorStatisticsFilterRequest filter);
}

