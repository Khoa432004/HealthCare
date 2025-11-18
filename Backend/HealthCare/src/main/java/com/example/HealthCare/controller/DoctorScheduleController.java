package com.example.HealthCare.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.UpdateWorkScheduleRequest;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.dto.response.WorkScheduleResponse;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.DoctorScheduleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/doctors/me/work-schedule")
@RequiredArgsConstructor
@Slf4j
public class DoctorScheduleController {

    private final DoctorScheduleService doctorScheduleService;
    private final UserAccountRepository userAccountRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_DOCTORS')")
    public ResponseEntity<ResponseSuccess> getMyWorkSchedule() {
        try {
            log.info("Getting work schedule for current doctor");
            UUID currentUserId = getCurrentUserId();
            WorkScheduleResponse schedule = doctorScheduleService.getWorkSchedule(currentUserId);
            return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, 
                    "Work schedule retrieved successfully", schedule));
        } catch (Exception e) {
            log.error("Error getting work schedule: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping
    @PreAuthorize("hasAuthority('VIEW_DOCTORS')")
    public ResponseEntity<ResponseSuccess> updateMyWorkSchedule(
            @Valid @RequestBody UpdateWorkScheduleRequest request) {
        try {
            log.info("Updating work schedule for current doctor");
            UUID currentUserId = getCurrentUserId();
            WorkScheduleResponse updatedSchedule = doctorScheduleService.updateWorkSchedule(currentUserId, request);
            return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, 
                    "Work schedule updated successfully", updatedSchedule));
        } catch (Exception e) {
            log.error("Error updating work schedule: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('VIEW_DOCTORS')")
    public ResponseEntity<ResponseSuccess> updateMyWorkSchedulePost(
            @Valid @RequestBody UpdateWorkScheduleRequest request) {
        return updateMyWorkSchedule(request);
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return user.getId();
    }
}

