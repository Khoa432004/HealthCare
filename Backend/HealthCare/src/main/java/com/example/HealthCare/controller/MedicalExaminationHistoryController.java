package com.example.HealthCare.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.HealthCare.dto.MedicalExaminationHistorySummaryDto;
import com.example.HealthCare.service.MedicalExaminationHistoryService;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/medicalExaminationHistory")
@RequiredArgsConstructor
public class MedicalExaminationHistoryController {
    
    private final MedicalExaminationHistoryService historyService;
    
    @GetMapping("/medicalexaminationhistory/{patientId}")
    public ResponseEntity<List<MedicalExaminationHistorySummaryDto>> getHistory(
            @PathVariable UUID patientId) {

        List<MedicalExaminationHistorySummaryDto> history = historyService.getHistoryByPatientId(patientId);
        return ResponseEntity.ok(history);
    }
    
}
