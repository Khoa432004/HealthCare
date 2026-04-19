package com.example.HealthCare.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.MedicalExaminationHistoryDetailDto;
import com.example.HealthCare.dto.MedicalExaminationHistorySummaryDto;
import com.example.HealthCare.dto.response.VitalMetricPointResponse;
import com.example.HealthCare.service.MedicalExaminationHistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/medicalexaminationhistory")
@RequiredArgsConstructor
public class MedicalExaminationHistoryController {
    
/////////////////////////////---------------------------
    private final MedicalExaminationHistoryService historyService;
    @GetMapping("/{patientId}")
    @PreAuthorize("hasAuthority('VIEW_MEDICAL_EXAMINATION_HISTORY')")
    public ResponseEntity<List<MedicalExaminationHistorySummaryDto>> getHistory(
            @PathVariable UUID patientId) {

        List<MedicalExaminationHistorySummaryDto> history = historyService.getHistoryByPatientId(patientId);
        return ResponseEntity.ok(history);
    }
    @GetMapping("/detail/{appointmentId}")
    @PreAuthorize("hasAuthority('VIEW_MEDICAL_EXAMINATION_HISTORY')")
    public ResponseEntity<List<MedicalExaminationHistoryDetailDto>> getDetailHistory(
            @PathVariable UUID appointmentId) {

        List<MedicalExaminationHistoryDetailDto> detailHistory = historyService.getDetailHistoryByAppointmentId(appointmentId);
        return ResponseEntity.ok(detailHistory);
    }

    /**
     * Combined vital-metrics feed for the patient's "Metrics" tab chart.
     * Returns a flat list of measurement points sourced from both the legacy
     * medical_report_vital_sign table and the new patient_vital_measurement
     * table, sorted by takenAt ascending.
     */
    @GetMapping("/{patientId}/vital-metrics")
    @PreAuthorize("hasAuthority('VIEW_MEDICAL_EXAMINATION_HISTORY')")
    public ResponseEntity<List<VitalMetricPointResponse>> getVitalMetrics(
            @PathVariable UUID patientId) {
        List<VitalMetricPointResponse> points = historyService.getVitalMetricPoints(patientId);
        return ResponseEntity.ok(points);
    }

}
