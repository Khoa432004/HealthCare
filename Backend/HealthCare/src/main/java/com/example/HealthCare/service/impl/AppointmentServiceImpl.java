package com.example.HealthCare.service.impl;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.response.AppointmentResponse;
import com.example.HealthCare.model.Appointment;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.service.AppointmentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMyAppointments(UUID userId, String userRole, OffsetDateTime startDate, OffsetDateTime endDate) {
        List<Appointment> appointments;
        
        String roleUpper = userRole != null ? userRole.toUpperCase() : "";
        if ("DOCTOR".equals(roleUpper)) {
            appointments = appointmentRepository.findByDoctorIdAndDateRange(userId, startDate, endDate);
        } else if ("PATIENT".equals(roleUpper)) {
            appointments = appointmentRepository.findByPatientIdAndDateRange(userId, startDate, endDate);
        } else {
            return List.of();
        }
        
        return appointments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        // Get patient info
        String patientName = null;
        String patientFullName = null;
        String patientGender = null;
        if (appointment.getPatient() != null) {
            patientName = appointment.getPatient().getFullName();
            patientFullName = appointment.getPatient().getFullName();
            patientGender = appointment.getPatient().getGender() != null 
                    ? appointment.getPatient().getGender().getValue() 
                    : null;
        }
        
        // Get doctor info
        String doctorName = null;
        String doctorFullName = null;
        String doctorGender = null;
        if (appointment.getDoctor() != null) {
            doctorName = appointment.getDoctor().getFullName();
            doctorFullName = appointment.getDoctor().getFullName();
            doctorGender = appointment.getDoctor().getGender() != null 
                    ? appointment.getDoctor().getGender().getValue() 
                    : null;
        }
        
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatientId())
                .doctorId(appointment.getDoctorId())
                .status(appointment.getStatus() != null ? appointment.getStatus().getValue() : "SCHEDULED")
                .scheduledStart(appointment.getScheduledStart())
                .scheduledEnd(appointment.getScheduledEnd())
                .title(appointment.getTitle())
                .reason(appointment.getReason())
                .symptomsOns(appointment.getSymptomsOns())
                .symptomsSever(appointment.getSymptomsSever())
                .currentMedication(appointment.getCurrentMedication())
                .notes(appointment.getNotes())
                .patientName(patientName)
                .patientFullName(patientFullName)
                .patientGender(patientGender)
                .doctorName(doctorName)
                .doctorFullName(doctorFullName)
                .doctorGender(doctorGender)
                .build();
    }
}

