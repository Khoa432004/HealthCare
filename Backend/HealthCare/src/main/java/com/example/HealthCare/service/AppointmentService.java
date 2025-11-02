package com.example.HealthCare.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.example.HealthCare.dto.response.AppointmentResponse;

public interface AppointmentService {
    /**
     * Get appointments for current user (doctor or patient) within date range
     * @param userId - Current user ID
     * @param userRole - User role (DOCTOR or PATIENT)
     * @param startDate - Start date for filtering
     * @param endDate - End date for filtering
     * @return List of appointments
     */
    List<AppointmentResponse> getMyAppointments(UUID userId, String userRole, OffsetDateTime startDate, OffsetDateTime endDate);
}

