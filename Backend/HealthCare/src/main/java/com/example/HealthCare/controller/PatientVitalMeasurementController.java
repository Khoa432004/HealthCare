package com.example.HealthCare.controller;

import java.util.List;
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

import com.example.HealthCare.dto.request.CreateVitalMeasurementRequest;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.dto.response.VitalMeasurementResponse;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.PatientVitalMeasurementService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/patient-vital-measurements")
@RequiredArgsConstructor
@Slf4j
public class PatientVitalMeasurementController {

    private final PatientVitalMeasurementService measurementService;
    private final UserAccountRepository userAccountRepository;

    /**
     * Persist a self-reported measurement for the currently logged-in patient.
     * The payload comes from the "Add Measurement" popup.
     */
    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ResponseSuccess> create(
        @Valid @RequestBody CreateVitalMeasurementRequest request
    ) {
        UUID patientId = getCurrentUserId();
        VitalMeasurementResponse response = measurementService.create(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ResponseSuccess(
            HttpStatus.CREATED, "Measurement saved successfully", response));
    }

    /**
     * Full list of self-reported measurements belonging to the logged-in
     * patient. Currently unused by the UI but handy for debugging / future
     * history screens.
     */
    @GetMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ResponseSuccess> listMine() {
        UUID patientId = getCurrentUserId();
        List<VitalMeasurementResponse> list = measurementService.listForPatient(patientId);
        return ResponseEntity.ok(new ResponseSuccess(
            HttpStatus.OK, "Measurements fetched successfully", list));
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
