package com.example.HealthCare.service.impl;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.CreateAppointmentRequest;
import com.example.HealthCare.dto.request.RescheduleAppointmentRequest;
import com.example.HealthCare.dto.response.AppointmentResponse;
import com.example.HealthCare.dto.response.AvailableSlotsResponse;
import com.example.HealthCare.enums.AppointmentStatus;
import com.example.HealthCare.exception.BadRequestException;
import com.example.HealthCare.exception.NotFoundException;
import com.example.HealthCare.model.Appointment;
import com.example.HealthCare.model.DoctorScheduleRule;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.model.AppointmentStatusHistory;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.repository.AppointmentStatusHistoryRepository;
import com.example.HealthCare.repository.DoctorProfileRepository;
import com.example.HealthCare.repository.DoctorScheduleRuleRepository;
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
    private final DoctorScheduleRuleRepository doctorScheduleRuleRepository;
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

    @Override
    @Transactional
    public AppointmentResponse rescheduleAppointment(UUID appointmentId, UUID patientId, RescheduleAppointmentRequest request) {
        log.info("Rescheduling appointment {} by patient {}", appointmentId, patientId);
        
        // Get appointment with relations
        Appointment appointment = appointmentRepository.findByIdWithRelations(appointmentId);
        if (appointment == null) {
            throw new NotFoundException("Appointment not found");
        }
        
        // Validate patient is the owner
        if (!appointment.getPatientId().equals(patientId)) {
            throw new BadRequestException("Only the patient who owns this appointment can reschedule it");
        }
        
        // Validate appointment status is SCHEDULED
        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new BadRequestException(
                String.format("Cannot reschedule appointment. Current status is %s. Only SCHEDULED appointments can be rescheduled.", 
                    appointment.getStatus().getValue())
            );
        }
        
        // Validate: must be at least 4 hours before the scheduled start time
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime scheduledStart = appointment.getScheduledStart();
        long hoursUntilAppointment = java.time.Duration.between(now, scheduledStart).toHours();
        
        if (hoursUntilAppointment < 4) {
            throw new BadRequestException(
                String.format("Cannot reschedule appointment. It must be at least 4 hours before the scheduled start time. " +
                    "Current time: %s, Scheduled start: %s, Hours remaining: %d", 
                    now.format(DATE_TIME_FORMATTER), 
                    scheduledStart.format(DATE_TIME_FORMATTER),
                    hoursUntilAppointment)
            );
        }
        
        // Validate new scheduled times
        if (request.getScheduledStart() == null || request.getScheduledEnd() == null) {
            throw new BadRequestException("New scheduled start and end times are required");
        }
        
        if (!request.getScheduledStart().isBefore(request.getScheduledEnd())) {
            throw new BadRequestException("New scheduled start time must be before end time");
        }
        
        // Validate new time is in the future (at least from now)
        if (request.getScheduledStart().isBefore(now)) {
            throw new BadRequestException("New scheduled start time must be in the future");
        }
        
        // Check for conflicts with patient's existing appointments (excluding current appointment)
        List<Appointment> patientConflicts = appointmentRepository.findConflictingAppointmentsForPatient(
                appointment.getPatientId(),
                request.getScheduledStart(),
                request.getScheduledEnd(),
                AppointmentStatus.CANCELED
        );
        // Remove current appointment from conflicts
        patientConflicts = patientConflicts.stream()
                .filter(a -> !a.getId().equals(appointmentId))
                .collect(Collectors.toList());
        
        // Check for conflicts with doctor's existing appointments (excluding current appointment)
        List<Appointment> doctorConflicts = appointmentRepository.findConflictingAppointmentsForDoctor(
                appointment.getDoctorId(),
                request.getScheduledStart(),
                request.getScheduledEnd(),
                AppointmentStatus.CANCELED
        );
        // Remove current appointment from conflicts
        doctorConflicts = doctorConflicts.stream()
                .filter(a -> !a.getId().equals(appointmentId))
                .collect(Collectors.toList());
        
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
        
        // Update appointment times
        OffsetDateTime oldScheduledStart = appointment.getScheduledStart();
        
        appointment.setScheduledStart(request.getScheduledStart());
        appointment.setScheduledEnd(request.getScheduledEnd());
        appointment.setStartedAt(request.getScheduledStart()); // Update started_at to match new scheduled start
        appointment.setEndedAt(request.getScheduledEnd()); // Update ended_at to match new scheduled end
        appointment.setUpdatedBy(patientId);
        appointment.setUpdatedAt(now);
        
        // Update title if needed (to reflect new date)
        String patientName = appointment.getPatient() != null ? appointment.getPatient().getFullName() : "Patient";
        String newAppointmentDate = request.getScheduledStart().toLocalDateTime().format(DATE_FORMATTER);
        String newTitle = String.format("%s - %s", patientName, newAppointmentDate);
        appointment.setTitle(newTitle);
        
        appointment = appointmentRepository.save(appointment);
        log.info("Appointment {} rescheduled successfully from {} to {}", 
            appointmentId, 
            oldScheduledStart.format(DATE_TIME_FORMATTER),
            request.getScheduledStart().format(DATE_TIME_FORMATTER));
        
        // Reload with relations for response
        Appointment updatedAppointment = appointmentRepository.findByIdWithRelations(appointmentId);
        if (updatedAppointment == null) {
            throw new RuntimeException("Failed to reload appointment after rescheduling");
        }
        
        return mapToResponse(updatedAppointment);
    }

    @Override
    @Transactional(readOnly = true)
    public AvailableSlotsResponse getAvailableSlots(UUID doctorId, LocalDate date, UUID excludeAppointmentId) {
        log.info("Getting available slots for doctor {} on date {}", doctorId, date);
        
        // Get weekday for the date (1=Monday, 7=Sunday)
        short weekday = DoctorScheduleRule.getWeekdayFromDate(date);
        
        // Get schedule rules for this weekday
        List<DoctorScheduleRule> allRules = doctorScheduleRuleRepository.findByDoctorIdOrderByWeekdayAscStartTimeAsc(doctorId);
        List<DoctorScheduleRule> dayRules = allRules.stream()
                .filter(rule -> rule.getWeekday() == weekday)
                .collect(Collectors.toList());
        
        if (dayRules.isEmpty()) {
            log.info("No schedule rules found for doctor {} on weekday {}", doctorId, weekday);
            return AvailableSlotsResponse.builder()
                    .availableSlots(List.of())
                    .build();
        }
        
        // Get session duration from first rule (assuming all rules have same session duration)
        int sessionDuration = dayRules.get(0).getSessionMinutes();
        
        // Get existing appointments for this doctor on this date (excluding canceled and excluded appointment)
        OffsetDateTime dayStart = date.atStartOfDay().atOffset(ZoneOffset.of("+07:00"));
        OffsetDateTime dayEnd = date.atTime(23, 59, 59).atOffset(ZoneOffset.of("+07:00"));
        
        List<Appointment> existingAppointments = appointmentRepository.findByDoctorIdAndDateRange(doctorId, dayStart, dayEnd);
        existingAppointments = existingAppointments.stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELED)
                .filter(a -> excludeAppointmentId == null || !a.getId().equals(excludeAppointmentId))
                .collect(Collectors.toList());
        
        // Generate all possible slots from schedule rules
        List<AvailableSlotsResponse.TimeSlot> allSlots = new ArrayList<>();
        OffsetDateTime now = OffsetDateTime.now();
        
        for (DoctorScheduleRule rule : dayRules) {
            LocalTime ruleStart = rule.getStartTime();
            LocalTime ruleEnd = rule.getEndTime();
            
            // Generate slots within this rule's time range
            LocalTime currentSlotStart = ruleStart;
            while (currentSlotStart.isBefore(ruleEnd)) {
                LocalTime currentSlotEnd = currentSlotStart.plusMinutes(sessionDuration);
                if (currentSlotEnd.isAfter(ruleEnd)) {
                    break; // Slot would exceed rule end time
                }
                
                // Convert to OffsetDateTime for the specific date
                OffsetDateTime slotStart = date.atTime(currentSlotStart).atOffset(ZoneOffset.of("+07:00"));
                OffsetDateTime slotEnd = date.atTime(currentSlotEnd).atOffset(ZoneOffset.of("+07:00"));
                
                // Only include slots from now onwards
                if (slotStart.isAfter(now) || slotStart.isEqual(now)) {
                    // Check if this slot conflicts with existing appointments
                    boolean isAvailable = true;
                    for (Appointment existing : existingAppointments) {
                        // Check if slots overlap
                        if (slotStart.isBefore(existing.getScheduledEnd()) && slotEnd.isAfter(existing.getScheduledStart())) {
                            isAvailable = false;
                            break;
                        }
                    }
                    
                    if (isAvailable) {
                        allSlots.add(AvailableSlotsResponse.TimeSlot.builder()
                                .startTime(slotStart.toString())
                                .endTime(slotEnd.toString())
                                .displayTime(currentSlotStart.format(DateTimeFormatter.ofPattern("HH:mm")))
                                .build());
                    }
                }
                
                // Move to next slot
                currentSlotStart = currentSlotStart.plusMinutes(sessionDuration);
            }
        }
        
        log.info("Found {} available slots for doctor {} on date {}", allSlots.size(), doctorId, date);
        
        return AvailableSlotsResponse.builder()
                .availableSlots(allSlots)
                .build();
    }

    @Override
    @Transactional
    public AppointmentResponse cancelAppointment(UUID appointmentId, UUID patientId, String cancellationReason) {
        log.info("Canceling appointment {} by patient {}", appointmentId, patientId);
        
        // Get appointment with relations
        Appointment appointment = appointmentRepository.findByIdWithRelations(appointmentId);
        if (appointment == null) {
            throw new NotFoundException("Appointment not found");
        }
        
        // Validate patient is the owner
        if (!appointment.getPatientId().equals(patientId)) {
            throw new BadRequestException("Only the patient who owns this appointment can cancel it");
        }
        
        // Validate appointment status is SCHEDULED
        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new BadRequestException(
                String.format("Cannot cancel appointment. Current status is %s. Only SCHEDULED appointments can be canceled.", 
                    appointment.getStatus().getValue())
            );
        }
        
        // Validate: must be at least 8 hours before the scheduled start time
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime scheduledStart = appointment.getScheduledStart();
        long hoursUntilAppointment = java.time.Duration.between(now, scheduledStart).toHours();
        
        if (hoursUntilAppointment < 8) {
            throw new BadRequestException(
                String.format("Cannot cancel appointment. It must be at least 8 hours before the scheduled start time. " +
                    "Current time: %s, Scheduled start: %s, Hours remaining: %d", 
                    now.format(DATE_TIME_FORMATTER), 
                    scheduledStart.format(DATE_TIME_FORMATTER),
                    hoursUntilAppointment)
            );
        }
        
        // Save old status for history
        AppointmentStatus oldStatus = appointment.getStatus();
        
        // Update appointment status
        appointment.setStatus(AppointmentStatus.CANCELED);
        appointment.setCanceledAt(now);
        appointment.setCancellationReason(cancellationReason != null ? cancellationReason : "Cancelled by patient");
        appointment.setCancellationBy("PATIENT");
        appointment.setUpdatedBy(patientId);
        appointment.setUpdatedAt(now);
        
        appointment = appointmentRepository.save(appointment);
        log.info("Appointment {} canceled successfully by patient {}", appointmentId, patientId);
        
        // Save status history
        AppointmentStatusHistory statusHistory = AppointmentStatusHistory.builder()
                .appointmentId(appointmentId)
                .oldStatus(oldStatus)
                .newStatus(AppointmentStatus.CANCELED)
                .changedAt(now)
                .changedBy(patientId)
                .build();
        statusHistoryRepository.save(statusHistory);
        log.info("Status history saved for appointment {}", appointmentId);
        
        // Reload with relations for response
        Appointment updatedAppointment = appointmentRepository.findByIdWithRelations(appointmentId);
        if (updatedAppointment == null) {
            throw new RuntimeException("Failed to reload appointment after cancellation");
        }
        
        return mapToResponse(updatedAppointment);
    }
}

