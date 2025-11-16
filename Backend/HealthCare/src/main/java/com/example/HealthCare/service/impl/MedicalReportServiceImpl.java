package com.example.HealthCare.service.impl;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.CreateMedicalReportRequest;
import com.example.HealthCare.dto.response.MedicalReportResponse;
import com.example.HealthCare.enums.AppointmentStatus;
import com.example.HealthCare.enums.MealRelation;
import com.example.HealthCare.enums.ReportStatus;
import com.example.HealthCare.exception.BadRequestException;
import com.example.HealthCare.exception.NotFoundException;
import com.example.HealthCare.model.Appointment;
import com.example.HealthCare.model.MedicalReport;
import com.example.HealthCare.model.MedicalReportMedication;
import com.example.HealthCare.model.MedicalReportVitalSign;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.repository.MedicalReportMedicationRepository;
import com.example.HealthCare.repository.MedicalReportRepository;
import com.example.HealthCare.repository.MedicalReportVitalSignRepository;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.MedicalReportService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicalReportServiceImpl implements MedicalReportService {

    private final MedicalReportRepository medicalReportRepository;
    private final MedicalReportVitalSignRepository vitalSignRepository;
    private final MedicalReportMedicationRepository medicationRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserAccountRepository userAccountRepository;

    @Override
    @Transactional
    public MedicalReportResponse saveDraft(CreateMedicalReportRequest request, UUID doctorId) {
        log.info("Saving medical report as draft for appointment {} by doctor {}", request.getAppointmentId(), doctorId);
        
        // Validate appointment and doctor
        validateAppointmentAndDoctor(request.getAppointmentId(), doctorId);
        
        // Get or create medical report
        MedicalReport report = medicalReportRepository.findByAppointmentId(request.getAppointmentId())
                .orElse(MedicalReport.builder()
                        .appointmentId(request.getAppointmentId())
                        .doctorId(doctorId)
                        .status(ReportStatus.DRAFT)
                        .build());
        
        // Update report fields
        updateReportFields(report, request);
        report.setStatus(ReportStatus.DRAFT);
        report.setDoctorId(doctorId);
        report = medicalReportRepository.save(report);
        
        // Save vital signs and medications
        saveVitalSigns(report.getId(), request.getVitalSigns());
        saveMedications(report.getId(), request.getMedications());
        
        log.info("Medical report saved as draft with ID: {}", report.getId());
        return mapToResponse(report);
    }

    @Override
    @Transactional
    public MedicalReportResponse completeReport(CreateMedicalReportRequest request, UUID doctorId) {
        log.info("Completing medical report for appointment {} by doctor {}", request.getAppointmentId(), doctorId);
        
        // Validate appointment and doctor
        Appointment appointment = validateAppointmentAndDoctor(request.getAppointmentId(), doctorId);
        
        // Validate appointment status is IN_PROCESS
        if (appointment.getStatus() != AppointmentStatus.IN_PROCESS) {
            throw new BadRequestException(
                String.format("Cannot complete report. Appointment status is %s. Only IN_PROCESS appointments can have completed reports.", 
                    appointment.getStatus().getValue())
            );
        }
        
        // Validate required fields for completion
        validateRequiredFields(request);
        
        // Get or create medical report
        MedicalReport report = medicalReportRepository.findByAppointmentId(request.getAppointmentId())
                .orElse(MedicalReport.builder()
                        .appointmentId(request.getAppointmentId())
                        .doctorId(doctorId)
                        .status(ReportStatus.DRAFT)
                        .build());
        
        // Check if report is already completed
        if (report.getStatus() == ReportStatus.COMPLETED) {
            throw new BadRequestException("Medical report is already completed and cannot be modified.");
        }
        
        // Update report fields
        updateReportFields(report, request);
        report.setStatus(ReportStatus.COMPLETED);
        report.setDoctorId(doctorId);
        report.setCompletedAt(OffsetDateTime.now());
        report = medicalReportRepository.save(report);
        
        // Save vital signs and medications
        saveVitalSigns(report.getId(), request.getVitalSigns());
        saveMedications(report.getId(), request.getMedications());
        
        // Update appointment status to COMPLETED
        OffsetDateTime now = OffsetDateTime.now();
        if (appointment.getStartedAt() == null) {
            appointment.setStartedAt(now);
        }
        appointment.setEndedAt(now);
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setUpdatedBy(doctorId);
        appointment.setUpdatedAt(now);
        appointmentRepository.save(appointment);
        
        log.info("Medical report completed with ID: {} and appointment {} marked as COMPLETED", report.getId(), appointment.getId());
        return mapToResponse(report);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalReportResponse getByAppointmentId(UUID appointmentId, UUID currentUserId) {
        try {
            if (appointmentId == null) {
                log.error("Appointment ID is null");
                throw new IllegalArgumentException("Appointment ID cannot be null");
            }
            
            if (currentUserId == null) {
                log.error("Current user ID is null");
                throw new IllegalArgumentException("Current user ID cannot be null");
            }
            
            log.info("Getting medical report for appointment ID: {} by user ID: {}", appointmentId, currentUserId);
            
            // First, get the appointment to validate ownership
            Appointment appointment = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> new NotFoundException("Appointment not found"));
            
            if (appointment == null) {
                log.error("Appointment is null for appointment ID: {}", appointmentId);
                throw new NotFoundException("Appointment not found");
            }
            
            // Get current user
            UserAccount currentUser = userAccountRepository.findByIdAndIsDeletedFalse(currentUserId)
                    .orElseThrow(() -> new NotFoundException("User not found"));
            
            if (currentUser == null) {
                log.error("Current user is null for user ID: {}", currentUserId);
                throw new NotFoundException("User not found");
            }
            
            // Validate that current user is either the doctor or patient of this appointment
            String userRoleValue = null;
            if (currentUser.getRole() != null) {
                try {
                    userRoleValue = currentUser.getRole().getValue();
                } catch (Exception e) {
                    log.warn("Error getting role value for user ID: {}", currentUserId, e);
                }
            }
            
            boolean isDoctor = userRoleValue != null && "DOCTOR".equalsIgnoreCase(userRoleValue);
            boolean isPatient = userRoleValue != null && "PATIENT".equalsIgnoreCase(userRoleValue);
            
            // Validate appointment ownership
            UUID appointmentDoctorId = appointment.getDoctorId();
            UUID appointmentPatientId = appointment.getPatientId();
            
            if (isDoctor) {
                if (appointmentDoctorId == null) {
                    log.error("Appointment doctor ID is null for appointment ID: {}", appointmentId);
                    throw new BadRequestException("Appointment doctor information is missing.");
                }
                if (!appointmentDoctorId.equals(currentUserId)) {
                    throw new BadRequestException("You are not the assigned doctor for this appointment.");
                }
            }
            
            if (isPatient) {
                if (appointmentPatientId == null) {
                    log.error("Appointment patient ID is null for appointment ID: {}", appointmentId);
                    throw new BadRequestException("Appointment patient information is missing.");
                }
                if (!appointmentPatientId.equals(currentUserId)) {
                    throw new BadRequestException("You are not the patient for this appointment.");
                }
            }
            
            if (!isDoctor && !isPatient) {
                throw new BadRequestException("Only doctors and patients can view medical reports.");
            }
            
            Optional<MedicalReport> reportOpt = medicalReportRepository.findByAppointmentId(appointmentId);
            
            if (reportOpt.isEmpty()) {
                log.info("No medical report found for appointment ID: {}", appointmentId);
                return null;
            }
            
            MedicalReport report = reportOpt.get();
            if (report == null) {
                log.error("Medical report is null after getting from repository for appointment ID: {}", appointmentId);
                return null;
            }
            
            UUID reportId = report.getId();
            if (reportId != null) {
                log.info("Found medical report with ID: {} for appointment ID: {}", reportId, appointmentId);
            } else {
                log.warn("Found medical report but ID is null for appointment ID: {}", appointmentId);
            }
            
            return mapToResponse(report);
        } catch (IllegalArgumentException | NotFoundException | BadRequestException e) {
            log.error("Error in getByAppointmentId for appointment ID: " + appointmentId, e);
            throw e;
        } catch (Exception e) {
            log.error("Error getting medical report for appointment ID: " + appointmentId, e);
            throw new RuntimeException("Failed to get medical report: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()), e);
        }
    }

    private Appointment validateAppointmentAndDoctor(UUID appointmentId, UUID doctorId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));
        
        // Validate doctor exists and is a doctor
        UserAccount doctor = userAccountRepository.findByIdAndIsDeletedFalse(doctorId)
                .orElseThrow(() -> new NotFoundException("Doctor not found"));
        
        if (doctor.getRole() == null || !"DOCTOR".equalsIgnoreCase(doctor.getRole().getValue())) {
            throw new BadRequestException("Only doctors can create medical reports");
        }
        
        // Validate doctor is the assigned doctor for this appointment
        if (!appointment.getDoctorId().equals(doctorId)) {
            throw new BadRequestException("You are not the assigned doctor for this appointment");
        }
        
        return appointment;
    }

    private void validateRequiredFields(CreateMedicalReportRequest request) {
        // According to UC-16, ICD code and Diagnosis are required when completing
        if (request.getIcdCode() == null || request.getIcdCode().trim().isEmpty()) {
            throw new BadRequestException("ICD code is required when completing the report");
        }
        
        if (request.getDiagnosis() == null || request.getDiagnosis().trim().isEmpty()) {
            throw new BadRequestException("Diagnosis is required when completing the report");
        }
    }

    private void updateReportFields(MedicalReport report, CreateMedicalReportRequest request) {
        report.setClinic(request.getClinic());
        report.setProvince(request.getProvince());
        report.setChronicConditions(request.getChronicConditions());
        report.setIllness(request.getIllness());
        report.setMedicalExam(request.getMedicalExam());
        report.setIcdCode(request.getIcdCode());
        report.setDiagnosis(request.getDiagnosis());
        report.setCoverage(request.getCoverage());
        report.setRecommendation(request.getRecommendation());
        report.setNote(request.getNote());
        report.setFollowUpDate(request.getFollowUpDate());
    }

    private void saveVitalSigns(UUID reportId, List<CreateMedicalReportRequest.VitalSignRequest> vitalSigns) {
        if (vitalSigns == null || vitalSigns.isEmpty()) {
            return;
        }
        
        // Delete existing vital signs
        vitalSignRepository.findByMedicalReportId(reportId).forEach(vs -> vitalSignRepository.delete(vs));
        
        // Save new vital signs
        List<MedicalReportVitalSign> signsToSave = vitalSigns.stream()
                .map(vs -> MedicalReportVitalSign.builder()
                        .medicalReportId(reportId)
                        .signType(vs.getSignType())
                        .value(vs.getValue())
                        .unit(vs.getUnit())
                        .build())
                .collect(Collectors.toList());
        
        vitalSignRepository.saveAll(signsToSave);
    }

    private void saveMedications(UUID reportId, List<CreateMedicalReportRequest.MedicationRequest> medications) {
        if (medications == null || medications.isEmpty()) {
            medicationRepository.deleteByMedicalReportId(reportId);
            return;
        }
        
        // Delete existing medications
        medicationRepository.deleteByMedicalReportId(reportId);
        
        // Save new medications
        List<MedicalReportMedication> medicationsToSave = medications.stream()
                .map(med -> {
                    MealRelation mealRelation = mapMealRelation(med.getMealRelation());
                    return MedicalReportMedication.builder()
                            .medicalReportId(reportId)
                            .medicationName(med.getMedicationName())
                            .dosage(med.getDosage())
                            .medicationType(med.getMedicationType())
                            .mealRelation(mealRelation)
                            .durationDays(med.getDurationDays())
                            .startDate(med.getStartDate())
                            .note(med.getNote())
                            .build();
                })
                .collect(Collectors.toList());
        
        medicationRepository.saveAll(medicationsToSave);
    }

    private MealRelation mapMealRelation(String mealRelation) {
        if (mealRelation == null || mealRelation.trim().isEmpty()) {
            throw new BadRequestException("Meal relation is required");
        }
        
        // Map frontend values to enum values
        String normalized = mealRelation.toLowerCase().trim();
        switch (normalized) {
            case "before-meal":
            case "before":
                return MealRelation.before;
            case "after-meal":
            case "after":
                return MealRelation.after;
            case "with-food":
            case "with":
                return MealRelation.with;
            case "anytime":
                // For "anytime", we'll use "with" as default
                return MealRelation.with;
            default:
                throw new BadRequestException("Invalid meal relation: " + mealRelation);
        }
    }

    private MedicalReportResponse mapToResponse(MedicalReport report) {
        try {
            if (report == null) {
                log.error("Medical report is null");
                throw new IllegalArgumentException("Medical report cannot be null");
            }
            
            UUID reportId = report.getId();
            if (reportId == null) {
                log.error("Medical report ID is null");
                throw new IllegalArgumentException("Medical report ID cannot be null");
            }
            
            log.debug("Mapping medical report to response, report ID: {}", reportId);
            
            List<MedicalReportVitalSign> vitalSigns;
            List<MedicalReportMedication> medications;
            
            try {
                vitalSigns = vitalSignRepository.findByMedicalReportId(reportId);
                if (vitalSigns == null) {
                    log.warn("Vital signs repository returned null for report ID: {}", reportId);
                    vitalSigns = new ArrayList<>();
                }
            } catch (Exception e) {
                log.error("Error fetching vital signs for report ID: " + reportId, e);
                vitalSigns = new ArrayList<>();
            }
            
            try {
                medications = medicationRepository.findByMedicalReportId(reportId);
                if (medications == null) {
                    log.warn("Medications repository returned null for report ID: {}", reportId);
                    medications = new ArrayList<>();
                }
            } catch (Exception e) {
                log.error("Error fetching medications for report ID: " + reportId, e);
                medications = new ArrayList<>();
            }
            
            log.debug("Found {} vital signs and {} medications for report ID: {}", 
                    vitalSigns != null ? vitalSigns.size() : 0, 
                    medications != null ? medications.size() : 0, 
                    reportId);
            
            // Build response with null-safe getters
            MedicalReportResponse.MedicalReportResponseBuilder builder = MedicalReportResponse.builder()
                    .id(reportId)
                    .appointmentId(report.getAppointmentId() != null ? report.getAppointmentId() : null)
                    .doctorId(report.getDoctorId() != null ? report.getDoctorId() : null)
                    .clinic(report.getClinic())
                    .province(report.getProvince())
                    .chronicConditions(report.getChronicConditions())
                    .illness(report.getIllness())
                    .medicalExam(report.getMedicalExam())
                    .icdCode(report.getIcdCode())
                    .diagnosis(report.getDiagnosis())
                    .coverage(report.getCoverage())
                    .recommendation(report.getRecommendation())
                    .note(report.getNote())
                    .followUpDate(report.getFollowUpDate())
                    .createdAt(report.getCreatedAt())
                    .updatedAt(report.getUpdatedAt())
                    .completedAt(report.getCompletedAt());
            
            // Handle status with null check
            if (report.getStatus() != null) {
                builder.status(report.getStatus().getValue());
            } else {
                log.warn("Medical report status is null for report ID: {}", reportId);
                builder.status(ReportStatus.DRAFT.getValue());
            }
            
            // Map vital signs with null checks
            builder.vitalSigns(vitalSigns.stream()
                    .filter(vs -> vs != null) // Filter out null vital signs
                    .map(vs -> {
                        try {
                            return MedicalReportResponse.VitalSignResponse.builder()
                                    .id(vs.getId())
                                    .signType(vs.getSignType() != null ? vs.getSignType() : "")
                                    .value(vs.getValue() != null ? vs.getValue() : "")
                                    .unit(vs.getUnit())
                                    .build();
                        } catch (Exception e) {
                            log.warn("Error mapping vital sign: {}", e.getMessage());
                            return null;
                        }
                    })
                    .filter(vs -> vs != null) // Filter out failed mappings
                    .collect(Collectors.toList()));
            
            // Map medications with null checks
            builder.medications(medications.stream()
                    .filter(med -> med != null) // Filter out null medications
                    .map(med -> {
                        try {
                            MedicalReportResponse.MedicationResponse.MedicationResponseBuilder medBuilder = 
                                    MedicalReportResponse.MedicationResponse.builder()
                                            .id(med.getId())
                                            .medicationName(med.getMedicationName() != null ? med.getMedicationName() : "")
                                            .dosage(med.getDosage() != null ? med.getDosage() : "")
                                            .medicationType(med.getMedicationType() != null ? med.getMedicationType() : "")
                                            .durationDays(med.getDurationDays())
                                            .startDate(med.getStartDate())
                                            .note(med.getNote());
                            
                            if (med.getMealRelation() != null) {
                                medBuilder.mealRelation(med.getMealRelation().getValue());
                            } else {
                                log.warn("Meal relation is null for medication ID: {}", med.getId());
                                medBuilder.mealRelation("before");
                            }
                            
                            return medBuilder.build();
                        } catch (Exception e) {
                            log.warn("Error mapping medication: {}", e.getMessage());
                            return null;
                        }
                    })
                    .filter(med -> med != null) // Filter out failed mappings
                    .collect(Collectors.toList()));
            
            return builder.build();
        } catch (Exception e) {
            log.error("Error mapping medical report to response", e);
            throw new RuntimeException("Failed to map medical report to response: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()), e);
        }
    }
}

