package com.example.HealthCare.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import java.time.LocalDate;

import com.example.HealthCare.dto.request.CreateAppointmentRequest;
import com.example.HealthCare.dto.request.RescheduleAppointmentRequest;
import com.example.HealthCare.dto.response.AppointmentResponse;
import com.example.HealthCare.dto.response.AvailableSlotsResponse;

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
    
    /**
     * Reschedule an appointment (change scheduled start and end times)
     * @param appointmentId - Appointment ID
     * @param patientId - ID of the patient rescheduling (must be the owner)
     * @param request - Reschedule request with new scheduled start and end times
     * @return Updated appointment response
     * @throws NotFoundException if appointment not found
     * @throws BadRequestException if validation fails (not patient owner, wrong status, conflicts, less than 4 hours before)
     */
    AppointmentResponse rescheduleAppointment(UUID appointmentId, UUID patientId, RescheduleAppointmentRequest request);
    
    /**
     * Get available time slots for a doctor on a specific date
     * @param doctorId - Doctor ID
     * @param date - Date to get available slots for
     * @param excludeAppointmentId - Optional appointment ID to exclude from conflicts (for rescheduling)
     * @return Available slots response
     */
    AvailableSlotsResponse getAvailableSlots(UUID doctorId, LocalDate date, UUID excludeAppointmentId);
    
    /**
     * Cancel an appointment (patient only)
     * @param appointmentId - Appointment ID
     * @param patientId - ID of the patient canceling (must be the owner)
     * @param cancellationReason - Optional reason for cancellation
     * @return Updated appointment response
     * @throws NotFoundException if appointment not found
     * @throws BadRequestException if validation fails (not patient owner, wrong status, less than 8 hours before)
     */
    AppointmentResponse cancelAppointment(UUID appointmentId, UUID patientId, String cancellationReason);
}

