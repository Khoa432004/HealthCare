package com.example.HealthCare.service.impl;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.CreateAppointmentRequest;
import com.example.HealthCare.dto.response.AppointmentResponse;
import com.example.HealthCare.enums.AppointmentStatus;
import com.example.HealthCare.exception.BadRequestException;
import com.example.HealthCare.exception.NotFoundException;
import com.example.HealthCare.model.Appointment;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.AppointmentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserAccountRepository userAccountRepository;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

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

    @Override
    @Transactional
    public AppointmentResponse createAppointment(CreateAppointmentRequest request, UUID doctorId) {
        log.info("Creating appointment for doctor: {}, patient: {}", doctorId, request.getPatientId());
        
        // Validate scheduled times
        if (request.getScheduledStart() == null || request.getScheduledEnd() == null) {
            throw new BadRequestException("Scheduled start and end times are required");
        }
        
        if (!request.getScheduledStart().isBefore(request.getScheduledEnd())) {
            throw new BadRequestException("Scheduled start time must be before end time");
        }
        
        // Validate patient exists
        UserAccount patient = userAccountRepository.findByIdAndIsDeletedFalse(request.getPatientId())
                .orElseThrow(() -> new NotFoundException("Patient not found"));
        
        // Validate doctor exists
        userAccountRepository.findByIdAndIsDeletedFalse(doctorId)
                .orElseThrow(() -> new NotFoundException("Doctor not found"));
        
        // Check for conflicts with patient's existing appointments
        List<Appointment> patientConflicts = appointmentRepository.findConflictingAppointmentsForPatient(
                request.getPatientId(),
                request.getScheduledStart(),
                request.getScheduledEnd(),
                AppointmentStatus.CANCELED
        );
        
        // Check for conflicts with doctor's existing appointments
        List<Appointment> doctorConflicts = appointmentRepository.findConflictingAppointmentsForDoctor(
                doctorId,
                request.getScheduledStart(),
                request.getScheduledEnd(),
                AppointmentStatus.CANCELED
        );
        
        // Build conflict message if any conflicts found
        List<String> conflictMessages = new ArrayList<>();
        
        if (!patientConflicts.isEmpty()) {
            for (Appointment conflict : patientConflicts) {
                String conflictTime = conflict.getScheduledStart().format(DATE_TIME_FORMATTER);
                conflictMessages.add(String.format("Bệnh nhân đã có lịch hẹn vào %s", conflictTime));
            }
        }
        
        if (!doctorConflicts.isEmpty()) {
            for (Appointment conflict : doctorConflicts) {
                String conflictTime = conflict.getScheduledStart().format(DATE_TIME_FORMATTER);
                conflictMessages.add(String.format("Bác sĩ đã có lịch hẹn vào %s", conflictTime));
            }
        }
        
        if (!conflictMessages.isEmpty()) {
            String errorMessage = String.join("; ", conflictMessages);
            throw new BadRequestException(errorMessage);
        }
        
        // Auto-generate title if not provided
        // Format: "Tên Bệnh nhân - Ngày khám"
        String title = request.getTitle();
        if (title == null || title.trim().isEmpty()) {
            String patientName = patient.getFullName();
            // Convert OffsetDateTime to LocalDateTime to get correct local time
            String appointmentDate = request.getScheduledStart().toLocalDateTime().format(DATE_FORMATTER);
            title = String.format("%s - %s", patientName, appointmentDate);
            log.info("Auto-generated title: {}", title);
        }
        
        // Create appointment
        // Note: started_at and ended_at are NOT NULL in schema, so we set them to scheduled times initially
        // They will be updated when the appointment actually starts
        Appointment appointment = Appointment.builder()
                .patientId(request.getPatientId())
                .doctorId(doctorId)
                .status(AppointmentStatus.SCHEDULED)
                .scheduledStart(request.getScheduledStart())
                .scheduledEnd(request.getScheduledEnd())
                .startedAt(request.getScheduledStart()) // Set to scheduled start initially
                .endedAt(request.getScheduledEnd()) // Set to scheduled end initially
                .title(title)
                .reason(request.getReason())
                .symptomsOns(request.getSymptomsOns())
                .symptomsSever(request.getSymptomsSever())
                .currentMedication(request.getCurrentMedication())
                .notes(request.getNotes())
                .consent(false)
                .cancellationBy("") // Set empty string as default since it's NOT NULL
                .createdBy(doctorId)
                .build();
        
        appointment = appointmentRepository.save(appointment);
        log.info("Appointment created successfully with ID: {}", appointment.getId());
        
        // Reload with relations for response
        Appointment savedAppointment = appointmentRepository.findByIdWithRelations(appointment.getId());
        if (savedAppointment == null) {
            throw new RuntimeException("Failed to reload appointment");
        }
        
        return mapToResponse(savedAppointment);
    }
}

