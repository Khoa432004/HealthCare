package com.example.HealthCare.service;

import java.util.List;
import java.util.UUID;

import com.example.HealthCare.dto.MedicalExaminationHistoryDetailDto;
import com.example.HealthCare.dto.MedicalExaminationHistorySummaryDto;

public interface MedicalExaminationHistoryService {
     public List<MedicalExaminationHistorySummaryDto> getHistoryByPatientId(UUID patientId);

     List<MedicalExaminationHistoryDetailDto> getDetailHistoryByAppointmentId(UUID patientId);
}
