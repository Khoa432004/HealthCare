package com.example.HealthCare.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.DoctorDetailDto;
import com.example.HealthCare.dto.DoctorSummaryDto;
import com.example.HealthCare.dto.MedicalExaminationHistoryDetailDto;
import com.example.HealthCare.dto.MedicalExaminationHistorySummaryDto;
import com.example.HealthCare.service.DoctorService;
import com.example.HealthCare.service.MedicalExaminationHistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    // GET /api/doctors?search=Le
    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_DOCTORS')")
    public ResponseEntity<List<DoctorSummaryDto>> getDoctors(
            @RequestParam(required = false) String search) {
        List<DoctorSummaryDto> doctors = doctorService.getAllDoctors(search);
        return ResponseEntity.ok(doctors);
    }

    // GET /api/doctors/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_DOCTORS')")
    public ResponseEntity<DoctorDetailDto> getDoctorDetail(@PathVariable String id) {
        DoctorDetailDto doctor = doctorService.getDoctorDetail(UUID.fromString(id));
        return ResponseEntity.ok(doctor);
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