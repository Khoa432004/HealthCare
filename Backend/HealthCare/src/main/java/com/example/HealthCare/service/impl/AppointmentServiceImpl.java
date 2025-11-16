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
import com.example.HealthCare.model.AppointmentStatusHistory;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.repository.AppointmentStatusHistoryRepository;
import com.example.HealthCare.repository.DoctorProfileRepository;
import com.example.HealthCare.repository.PatientProfileRepository;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.AppointmentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentStatusHistoryRepository statusHistoryRepository;
    private final UserAccountRepository userAccountRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientProfileRepository patientProfileRepository;
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
        String patientPhoneNumber = null;
        String patientAddress = null;
        if (appointment.getPatient() != null) {
            patientName = appointment.getPatient().getFullName();
            patientFullName = appointment.getPatient().getFullName();
            patientGender = appointment.getPatient().getGender() != null 
                    ? appointment.getPatient().getGender().getValue() 
                    : null;
            patientPhoneNumber = appointment.getPatient().getPhoneNumber();
            
            // Get patient profile for address
            if (appointment.getPatientId() != null) {
                var patientProfileOpt = patientProfileRepository.findByUserId(appointment.getPatientId());
                if (patientProfileOpt.isPresent()) {
                    patientAddress = patientProfileOpt.get().getAddress();
                }
            }
        }
        
        // Get doctor info
        String doctorName = null;
        String doctorFullName = null;
        String doctorGender = null;
        String doctorTitle = null;
        String doctorPhoneNumber = null;
        String doctorWorkplace = null;
        String doctorSpecialties = null;
        
        if (appointment.getDoctor() != null) {
            doctorName = appointment.getDoctor().getFullName();
            doctorFullName = appointment.getDoctor().getFullName();
            doctorGender = appointment.getDoctor().getGender() != null 
                    ? appointment.getDoctor().getGender().getValue() 
                    : null;
            doctorPhoneNumber = appointment.getDoctor().getPhoneNumber();
            
            // Get doctor profile info
            if (appointment.getDoctorId() != null) {
                var doctorProfileOpt = doctorProfileRepository.findByUserId(appointment.getDoctorId());
                if (doctorProfileOpt.isPresent()) {
                    var profile = doctorProfileOpt.get();
                    doctorTitle = profile.getTitle();
                    doctorWorkplace = profile.getWorkplaceName() != null 
                            ? profile.getWorkplaceName() 
                            : profile.getFacilityName();
                    doctorSpecialties = profile.getSpecialties();
                }
            }
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
                .patientPhoneNumber(patientPhoneNumber)
                .patientAddress(patientAddress)
                .doctorName(doctorName)
                .doctorFullName(doctorFullName)
                .doctorGender(doctorGender)
                .doctorTitle(doctorTitle)
                .doctorPhoneNumber(doctorPhoneNumber)
                .doctorWorkplace(doctorWorkplace)
                .doctorSpecialties(doctorSpecialties)
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

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(UUID appointmentId, UUID userId) {
        log.info("Getting appointment by ID: {} for user: {}", appointmentId, userId);
        
        // Get appointment with relations
        Appointment appointment = appointmentRepository.findByIdWithRelations(appointmentId);
        if (appointment == null) {
            throw new NotFoundException("Appointment not found");
        }
        
        // Check authorization: user must be either the patient or the doctor of this appointment
        boolean isAuthorized = appointment.getPatientId().equals(userId) || 
                              appointment.getDoctorId().equals(userId);
        
        if (!isAuthorized) {
            throw new BadRequestException("You do not have permission to view this appointment");
        }
        
        return mapToResponse(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponse confirmAppointment(UUID appointmentId, UUID doctorId) {
        log.info("Confirming appointment {} by doctor {}", appointmentId, doctorId);
        
        // Get appointment with relations
        Appointment appointment = appointmentRepository.findByIdWithRelations(appointmentId);
        if (appointment == null) {
            throw new NotFoundException("Appointment not found");
        }
        
        // Validate doctor exists and is a doctor
        UserAccount doctor = userAccountRepository.findByIdAndIsDeletedFalse(doctorId)
                .orElseThrow(() -> new NotFoundException("Doctor not found"));
        
        if (doctor.getRole() == null || !"DOCTOR".equalsIgnoreCase(doctor.getRole().getValue())) {
            throw new BadRequestException("Only doctors can confirm appointments");
        }
        
        // Validate doctor is the assigned doctor for this appointment
        if (!appointment.getDoctorId().equals(doctorId)) {
            throw new BadRequestException("You are not the assigned doctor for this appointment");
        }
        
        // Validate appointment status is SCHEDULED
        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new BadRequestException(
                String.format("Cannot confirm appointment. Current status is %s. Only SCHEDULED appointments can be confirmed.", 
                    appointment.getStatus().getValue())
            );
        }
        
        // Time validation removed - allow confirmation at any time when status is SCHEDULED
        // The appointment can be confirmed as long as it's in SCHEDULED status
        OffsetDateTime now = OffsetDateTime.now();
        
        // Save old status for history
        AppointmentStatus oldStatus = appointment.getStatus();
        
        // Update appointment status and started_at
        appointment.setStatus(AppointmentStatus.IN_PROCESS);
        appointment.setStartedAt(now); // Set actual start time
        appointment.setUpdatedBy(doctorId);
        appointment.setUpdatedAt(now);
        
        appointment = appointmentRepository.save(appointment);
        log.info("Appointment {} confirmed successfully. Status changed to IN_PROCESS", appointmentId);
        
        // Save status history
        AppointmentStatusHistory statusHistory = AppointmentStatusHistory.builder()
                .appointmentId(appointmentId)
                .oldStatus(oldStatus)
                .newStatus(AppointmentStatus.IN_PROCESS)
                .changedAt(now)
                .changedBy(doctorId)
                .build();
        statusHistoryRepository.save(statusHistory);
        log.info("Status history saved for appointment {}", appointmentId);
        
        // Reload with relations for response
        Appointment updatedAppointment = appointmentRepository.findByIdWithRelations(appointmentId);
        if (updatedAppointment == null) {
            throw new RuntimeException("Failed to reload appointment after confirmation");
        }
        
        return mapToResponse(updatedAppointment);
    }
}

