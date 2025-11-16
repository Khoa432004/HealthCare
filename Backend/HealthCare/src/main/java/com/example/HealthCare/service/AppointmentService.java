package com.example.HealthCare.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.example.HealthCare.dto.request.CreateAppointmentRequest;
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
    
    /**
     * Create a new appointment
     * @param request - Appointment creation request
     * @param doctorId - ID of the doctor creating the appointment
     * @return Created appointment response
     * @throws BadRequestException if there are conflicts or validation errors
     */
    AppointmentResponse createAppointment(CreateAppointmentRequest request, UUID doctorId);
    
    /**
     * Get appointment by ID
     * @param appointmentId - Appointment ID
     * @param userId - Current user ID (for authorization check)
     * @return Appointment response
     * @throws NotFoundException if appointment not found
     * @throws BadRequestException if user doesn't have permission to view this appointment
     */
    AppointmentResponse getAppointmentById(UUID appointmentId, UUID userId);
    
    /**
     * Confirm/start an appointment (change status to IN_PROCESS)
     * @param appointmentId - Appointment ID
     * @param doctorId - ID of the doctor confirming the appointment
     * @return Updated appointment response
     * @throws NotFoundException if appointment not found
     * @throws BadRequestException if validation fails (not doctor, not assigned doctor, wrong status, wrong time)
     */
    AppointmentResponse confirmAppointment(UUID appointmentId, UUID doctorId);
}

