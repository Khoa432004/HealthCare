package com.example.HealthCare.controller;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.response.AppointmentResponse;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.AppointmentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@Slf4j
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserAccountRepository userAccountRepository;

    /**
     * Get appointments for current user (doctor or patient)
     * @param startDate - Optional start date filter (ISO 8601 format)
     * @param endDate - Optional end date filter (ISO 8601 format)
     * @return List of appointments
     */
    @GetMapping("/my-appointments")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> getMyAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate) {
        try {
            UUID userId = getCurrentUserId();
            UserAccount user = userAccountRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            String userRole = user.getRole() != null ? user.getRole().getValue() : "PATIENT";
            
            // Default to current month if no date range provided
            OffsetDateTime defaultStartDate = startDate;
            OffsetDateTime defaultEndDate = endDate;
            
            if (defaultStartDate == null || defaultEndDate == null) {
                OffsetDateTime now = OffsetDateTime.now();
                if (defaultStartDate == null) {
                    defaultStartDate = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                }
                if (defaultEndDate == null) {
                    defaultEndDate = now.withDayOfMonth(now.toLocalDate().lengthOfMonth())
                            .withHour(23).withMinute(59).withSecond(59);
                }
            }
            
            List<AppointmentResponse> appointments = appointmentService.getMyAppointments(
                    userId, 
                    userRole, 
                    defaultStartDate, 
                    defaultEndDate
            );
            
            return ResponseEntity.ok(Map.of("success", true, "data", appointments));
        } catch (Exception e) {
            log.error("Error getting appointments", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return user.getId();
    }
}

