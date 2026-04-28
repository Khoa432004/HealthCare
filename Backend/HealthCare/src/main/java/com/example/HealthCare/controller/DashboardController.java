package com.example.HealthCare.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.DashboardFilterRequest;
import com.example.HealthCare.dto.response.DashboardStatsResponse;
import com.example.HealthCare.dto.response.PatientDashboardOverviewResponse;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.DashboardService;
import com.example.HealthCare.service.PatientDashboardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;
    private final PatientDashboardService patientDashboardService;
    private final UserAccountRepository userAccountRepository;

    @PostMapping("/stats")
    @PreAuthorize("hasAuthority('VIEW_DASHBOARD')") // Admin only
    public ResponseEntity<?> getDashboardStats(@RequestBody(required = false) DashboardFilterRequest filter) {
        try {
            if (filter == null) {
                filter = DashboardFilterRequest.builder()
                        .period("week")
                        .build();
            }
            DashboardStatsResponse stats = dashboardService.getDashboardStats(filter);
            return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Dashboard stats retrieved successfully", stats));
        } catch (Exception ex) {
            log.error("Error getting dashboard stats: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ResponseSuccess(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get dashboard stats: " + ex.getMessage()));
        }
    }

    @GetMapping("/patient-overview")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> getPatientDashboardOverview() {
        try {
            UUID patientId = getCurrentUserId();
            PatientDashboardOverviewResponse data = patientDashboardService.getOverview(patientId);
            return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Patient dashboard overview retrieved successfully", data));
        } catch (Exception ex) {
            log.error("Error getting patient dashboard overview: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ResponseSuccess(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get patient dashboard overview: " + ex.getMessage()));
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

