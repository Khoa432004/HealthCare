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

import com.example.HealthCare.dto.request.DoctorStatisticsFilterRequest;
import com.example.HealthCare.dto.response.DoctorStatisticsResponse;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.DoctorStatisticsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/doctors/statistics")
@RequiredArgsConstructor
@Slf4j
public class DoctorStatisticsController {

    private final DoctorStatisticsService doctorStatisticsService;
    private final UserAccountRepository userAccountRepository;

    @PostMapping
    @PreAuthorize("hasAuthority('VIEW_DOCTORS')")
    public ResponseEntity<?> getDoctorStatistics(@RequestBody(required = false) DoctorStatisticsFilterRequest filter) {
        try {
            UUID currentUserId = getCurrentUserId();
            
            // If no filter provided, default to "today"
            if (filter == null) {
                filter = DoctorStatisticsFilterRequest.builder()
                        .period("today")
                        .build();
            }
            
            DoctorStatisticsResponse stats = doctorStatisticsService.getDoctorStatistics(currentUserId, filter);
            return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Doctor statistics retrieved successfully", stats));
        } catch (Exception ex) {
            log.error("Error getting doctor statistics: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ResponseSuccess(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get doctor statistics: " + ex.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_DOCTORS')")
    public ResponseEntity<?> getDoctorStatisticsDefault() {
        try {
            UUID currentUserId = getCurrentUserId();
            
            DoctorStatisticsFilterRequest filter = DoctorStatisticsFilterRequest.builder()
                    .period("today")
                    .build();
            
            DoctorStatisticsResponse stats = doctorStatisticsService.getDoctorStatistics(currentUserId, filter);
            return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Doctor statistics retrieved successfully", stats));
        } catch (Exception ex) {
            log.error("Error getting doctor statistics: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ResponseSuccess(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get doctor statistics: " + ex.getMessage()));
        }
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        return userAccountRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}

