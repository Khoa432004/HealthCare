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

import com.example.HealthCare.dto.request.UpdatePersonalInfoRequest;
import com.example.HealthCare.dto.response.PersonalInfoDetailResponse;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Slf4j
public class PatientController {

    private final UserService userService;
    private final UserAccountRepository userAccountRepository;

    // GET /api/patients/me/personal-info
    @GetMapping("/me/personal-info")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ResponseSuccess> getMyPersonalInfo() {
        try {
            log.info("Getting personal info for current patient");
            UUID currentUserId = getCurrentUserId();
            PersonalInfoDetailResponse personalInfo = userService.getPersonalInfo(currentUserId);
            return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, 
                    "Personal information retrieved successfully", personalInfo));
        } catch (Exception e) {
            log.error("Error getting personal info: {}", e.getMessage(), e);
            throw e;
        }
    }

    // PUT /api/patients/me/personal-info
    @PutMapping("/me/personal-info")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ResponseSuccess> updateMyPersonalInfo(@Valid @RequestBody UpdatePersonalInfoRequest request) {
        try {
            log.info("Updating personal info for current patient");
            UUID currentUserId = getCurrentUserId();
            PersonalInfoDetailResponse updatedInfo = userService.updatePersonalInfo(currentUserId, request);
            return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, 
                    "Personal information updated successfully", updatedInfo));
        } catch (Exception e) {
            log.error("Error updating personal info: {}", e.getMessage(), e);
            throw e;
        }
    }

    // POST /api/patients/me/personal-info (alternative endpoint)
    @PostMapping("/me/personal-info")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ResponseSuccess> updateMyPersonalInfoPost(@Valid @RequestBody UpdatePersonalInfoRequest request) {
        return updateMyPersonalInfo(request);
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return user.getId();
    }
}

