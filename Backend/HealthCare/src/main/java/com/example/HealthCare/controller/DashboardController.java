package com.example.HealthCare.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.DashboardFilterRequest;
import com.example.HealthCare.dto.response.DashboardStatsResponse;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.service.DashboardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    @PostMapping("/stats")
    @PreAuthorize("hasAuthority('VIEW_DASHBOARD')") // Admin only
    public ResponseEntity<?> getDashboardStats(@RequestBody(required = false) DashboardFilterRequest filter) {
        try {
            if (filter == null) {
                filter = DashboardFilterRequest.builder()
                        .period("week")
                        .build();
            }
            
            log.info("Getting dashboard stats with filter: {}", filter);
            DashboardStatsResponse stats = dashboardService.getDashboardStats(filter);
            return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Dashboard stats retrieved successfully", stats));
        } catch (Exception ex) {
            log.error("Error getting dashboard stats: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ResponseSuccess(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get dashboard stats: " + ex.getMessage()));
        }
    }
}

