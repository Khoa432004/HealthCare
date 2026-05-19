package com.example.HealthCare.service;

import java.time.OffsetDateTime;
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

     /**
      * Range-restricted variant used by the new "patient-metrics" UI which
      * navigates by week / month / year. Either bound may be {@code null}
      * (interpreted as "open ended"); when both are {@code null} the
      * full history is returned.
      */
     List<VitalMetricPointResponse> getVitalMetricPointsInRange(
          UUID patientId, OffsetDateTime from, OffsetDateTime to);
}
