package com.example.HealthCare.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;

import com.example.HealthCare.dto.DoctorDetailDto;
import com.example.HealthCare.dto.DoctorSummaryDto;
import com.example.HealthCare.dto.MedicalExaminationHistoryDetailDto;
import com.example.HealthCare.dto.MedicalExaminationHistorySummaryDto;
import com.example.HealthCare.dto.request.UpdateProfessionalInfoRequest;
import com.example.HealthCare.dto.response.ProfessionalInfoResponse;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.DoctorService;
import com.example.HealthCare.service.MedicalExaminationHistoryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Slf4j
public class DoctorController {

    private final DoctorService doctorService;
    private final UserAccountRepository userAccountRepository;

    // GET /api/doctors?search=Le
    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_DOCTORS')")
    public ResponseEntity<List<DoctorSummaryDto>> getDoctors(
            @RequestParam(required = false) String search) {
        List<DoctorSummaryDto> doctors = doctorService.getAllDoctors(search);
        return ResponseEntity.ok(doctors);
    }

    // GET /api/doctors/me/professional-info (must be before /{id} to avoid path conflict)
    @GetMapping("/me/professional-info")
    @PreAuthorize("hasAuthority('VIEW_DOCTORS')")
    public ResponseEntity<ResponseSuccess> getMyProfessionalInfo() {
        try {
            log.info("Getting professional info for current doctor");
            UUID currentUserId = getCurrentUserId();
            log.info("Current user ID: {}", currentUserId);
            ProfessionalInfoResponse professionalInfo = doctorService.getProfessionalInfo(currentUserId);
            log.info("Professional info retrieved successfully");
            return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Professional information retrieved successfully", professionalInfo));
        } catch (Exception e) {
            log.error("Error getting professional info: {}", e.getMessage(), e);
            throw e;
        }
    }

    // POST /api/doctors/me/update-professional-info (primary endpoint - simplest path)
    @PostMapping("/me/update-professional-info")
    @PreAuthorize("hasAuthority('VIEW_DOCTORS')")
    public ResponseEntity<ResponseSuccess> updateMyProfessionalInfoPostAlt(@Valid @RequestBody UpdateProfessionalInfoRequest request) {
        try {
            log.info("POST /me/update-professional-info: Updating professional info for current doctor - Request received");
            UUID currentUserId = getCurrentUserId();
            log.info("Current user ID: {}", currentUserId);
            log.info("Request data - Title: {}, Facility: {}", request.getTitle(), request.getFacilityName());
            ProfessionalInfoResponse updatedInfo = doctorService.updateProfessionalInfo(currentUserId, request);
            log.info("Professional info updated successfully");
            return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Professional information updated successfully", updatedInfo));
        } catch (Exception e) {
            log.error("Error updating professional info: {}", e.getMessage(), e);
            throw e;
        }
    }

    // PUT /api/doctors/me/professional-info (alternative endpoint)
    @PutMapping("/me/professional-info")
    @PreAuthorize("hasAuthority('VIEW_DOCTORS')")
    public ResponseEntity<ResponseSuccess> updateMyProfessionalInfo(@Valid @RequestBody UpdateProfessionalInfoRequest request) {
        try {
            log.info("PUT /me/professional-info: Updating professional info for current doctor - Request received");
            UUID currentUserId = getCurrentUserId();
            log.info("Current user ID: {}", currentUserId);
            log.info("Request data - Title: {}, Facility: {}", request.getTitle(), request.getFacilityName());
            ProfessionalInfoResponse updatedInfo = doctorService.updateProfessionalInfo(currentUserId, request);
            log.info("Professional info updated successfully");
            return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Professional information updated successfully", updatedInfo));
        } catch (Exception e) {
            log.error("Error updating professional info: {}", e.getMessage(), e);
            throw e;
        }
    }

    // POST /api/doctors/me/professional-info/update (alternative endpoint for compatibility)
    @PostMapping("/me/professional-info/update")
    @PreAuthorize("hasAuthority('VIEW_DOCTORS')")
    public ResponseEntity<ResponseSuccess> updateMyProfessionalInfoPost(@Valid @RequestBody UpdateProfessionalInfoRequest request) {
        try {
            log.info("POST /me/professional-info/update: Updating professional info for current doctor - Request received");
            UUID currentUserId = getCurrentUserId();
            log.info("Current user ID: {}", currentUserId);
            log.info("Request data - Title: {}, Facility: {}", request.getTitle(), request.getFacilityName());
            ProfessionalInfoResponse updatedInfo = doctorService.updateProfessionalInfo(currentUserId, request);
            log.info("Professional info updated successfully");
            return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Professional information updated successfully", updatedInfo));
        } catch (Exception e) {
            log.error("Error updating professional info: {}", e.getMessage(), e);
            throw e;
        }
    }

    // GET /api/doctors/{id}
    // Using regex pattern to ensure only UUIDs match, not "me"
    @GetMapping("/{id:^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$}")
    @PreAuthorize("hasAuthority('VIEW_DOCTORS')")
    public ResponseEntity<DoctorDetailDto> getDoctorDetail(@PathVariable String id) {
        DoctorDetailDto doctor = doctorService.getDoctorDetail(UUID.fromString(id));
        return ResponseEntity.ok(doctor);
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return user.getId();
    }







/////////////////////////////---------------------------
    private final MedicalExaminationHistoryService historyService;
    @GetMapping("/medicalexaminationhistory/{patientId}")
    @PreAuthorize("hasAuthority('VIEW_MEDICAL_EXAMINATION_HISTORY')")
    public ResponseEntity<List<MedicalExaminationHistorySummaryDto>> getHistory(
            @PathVariable UUID patientId) {

        List<MedicalExaminationHistorySummaryDto> history = historyService.getHistoryByPatientId(patientId);
        return ResponseEntity.ok(history);
    }
    @GetMapping("/medicalexaminationhistory/detail/{appointmentId}")
    @PreAuthorize("hasAuthority('VIEW_MEDICAL_EXAMINATION_HISTORY')")
    public ResponseEntity<List<MedicalExaminationHistoryDetailDto>> getDetailHistory(
            @PathVariable UUID appointmentId) {

        List<MedicalExaminationHistoryDetailDto> detailHistory = historyService.getDetailHistoryByAppointmentId(appointmentId);
        return ResponseEntity.ok(detailHistory);
    }
}