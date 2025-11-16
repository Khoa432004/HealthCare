package com.example.HealthCare.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.CreateMedicalReportRequest;
import com.example.HealthCare.dto.response.MedicalReportResponse;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.MedicalReportService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/medical-reports")
@RequiredArgsConstructor
@Slf4j
@Validated
public class MedicalReportController {

    private final MedicalReportService medicalReportService;
    private final UserAccountRepository userAccountRepository;

    /**
     * Save medical report as draft
     * @param request - Medical report data
     * @return Saved medical report response
     */
    @PostMapping("/draft")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> saveDraft(@Valid @RequestBody CreateMedicalReportRequest request) {
        try {
            UUID doctorId = getCurrentUserId();
            MedicalReportResponse response = medicalReportService.saveDraft(request, doctorId);
            return ResponseEntity.ok(Map.of("success", true, "data", response));
        } catch (Exception e) {
            log.error("Error saving medical report as draft", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Complete medical report (status = COMPLETED)
     * @param request - Medical report data
     * @return Completed medical report response
     */
    @PostMapping("/complete")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> completeReport(@Valid @RequestBody CreateMedicalReportRequest request) {
        try {
            UUID doctorId = getCurrentUserId();
            MedicalReportResponse response = medicalReportService.completeReport(request, doctorId);
            return ResponseEntity.ok(Map.of("success", true, "data", response));
        } catch (Exception e) {
            log.error("Error completing medical report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Get medical report by appointment ID
     * @param appointmentId - Appointment ID
     * @return Medical report response
     */
    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> getByAppointmentId(@PathVariable String appointmentId) {
        try {
            log.info("Getting medical report for appointment ID: {}", appointmentId);
            
            UUID currentUserId = getCurrentUserId();
            if (currentUserId == null) {
                log.error("Current user ID is null");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "error", "unauthorized", "message", "User not authenticated"));
            }
            
            // Validate and parse UUID
            UUID appointmentUuid;
            try {
                appointmentUuid = UUID.fromString(appointmentId);
            } catch (IllegalArgumentException e) {
                log.error("Invalid appointment ID format: {}", appointmentId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "error", "bad_request", "message", "Invalid appointment ID format"));
            }
            
            // Validate that the current user is either the doctor or patient of this appointment
            // This validation is done in the service layer
            MedicalReportResponse response = medicalReportService.getByAppointmentId(appointmentUuid, currentUserId);
            if (response == null) {
                log.info("No medical report found for appointment ID: {}", appointmentId);
                return ResponseEntity.ok(Map.of("success", true, "data", null));
            }
            log.info("Medical report found for appointment ID: {}, status: {}", appointmentId, 
                    response.getStatus() != null ? response.getStatus() : "null");
            return ResponseEntity.ok(Map.of("success", true, "data", response));
        } catch (RuntimeException e) {
            // Let GlobalExceptionHandler handle it
            log.error("RuntimeException getting medical report for appointment ID: " + appointmentId, e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected exception getting medical report for appointment ID: " + appointmentId, e);
            // Let GlobalExceptionHandler handle it
            throw new RuntimeException("Failed to get medical report: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()), e);
        }
    }

    private UUID getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null) {
                log.error("Authentication is null");
                throw new RuntimeException("User not authenticated");
            }
            
            String email = authentication.getName();
            if (email == null || email.trim().isEmpty()) {
                log.error("Email is null or empty in authentication");
                throw new RuntimeException("User email not found");
            }
            
            UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (user == null) {
                log.error("User account is null for email: {}", email);
                throw new RuntimeException("User not found");
            }
            
            UUID userId = user.getId();
            if (userId == null) {
                log.error("User ID is null for email: {}", email);
                throw new RuntimeException("User ID not found");
            }
            
            return userId;
        } catch (Exception e) {
            log.error("Error getting current user ID: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get current user ID: " + e.getMessage(), e);
        }
    }
}

