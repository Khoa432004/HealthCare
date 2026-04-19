package com.example.HealthCare.service;

import java.util.List;
import java.util.UUID;

import com.example.HealthCare.dto.MedicalExaminationHistoryDetailDto;
import com.example.HealthCare.dto.MedicalExaminationHistorySummaryDto;
import com.example.HealthCare.dto.response.VitalMetricPointResponse;

public interface MedicalExaminationHistoryService {
     public List<MedicalExaminationHistorySummaryDto> getHistoryByPatientId(UUID patientId);

     List<MedicalExaminationHistoryDetailDto> getDetailHistoryByAppointmentId(UUID patientId);

     /**
      * Combined feed (legacy report-sourced vital signs + self-reported
      * measurements) used to drive the "Metrics" tab chart on the patient
      * dashboard.
      */
     List<VitalMetricPointResponse> getVitalMetricPoints(UUID patientId);
}
