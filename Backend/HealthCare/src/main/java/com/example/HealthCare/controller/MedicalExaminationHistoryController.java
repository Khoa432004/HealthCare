package com.example.HealthCare.controller;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
     *
     * Optional query parameters (added to match the ysalus-source patient
     * metrics UI):
     *  - {@code period}: "week" | "month" | "year". When provided alone, the
     *    range is computed against "now" (Mon→Sun for week, month start→end,
     *    year start→end).
     *  - {@code from} / {@code to}: ISO-8601 timestamps that override the
     *    period-derived range. Either or both can be omitted.
     *
     * When neither {@code period} nor {@code from}/{@code to} is provided the
     * legacy behavior is preserved (return all points).
     */
    @GetMapping("/{patientId}/vital-metrics")
    @PreAuthorize("hasAuthority('VIEW_MEDICAL_EXAMINATION_HISTORY')")
    public ResponseEntity<List<VitalMetricPointResponse>> getVitalMetrics(
            @PathVariable UUID patientId,
            @RequestParam(name = "period", required = false) String period,
            @RequestParam(name = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(name = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {

        OffsetDateTime effectiveFrom = from;
        OffsetDateTime effectiveTo = to;

        if ((effectiveFrom == null || effectiveTo == null) && period != null) {
            OffsetDateTime[] derived = derivePeriodRange(period);
            if (derived != null) {
                if (effectiveFrom == null) effectiveFrom = derived[0];
                if (effectiveTo == null) effectiveTo = derived[1];
            }
        }

        List<VitalMetricPointResponse> points;
        if (effectiveFrom != null || effectiveTo != null) {
            points = historyService.getVitalMetricPointsInRange(
                    patientId, effectiveFrom, effectiveTo);
        } else {
            points = historyService.getVitalMetricPoints(patientId);
        }
        return ResponseEntity.ok(points);
    }

    /**
     * Translate a "week" / "month" / "year" hint into [start, end] aligned to
     * the calendar (Monday→Sunday week, first→last day of month, Jan 1→Dec 31).
     * Returns {@code null} for unknown values.
     */
    private OffsetDateTime[] derivePeriodRange(String period) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        switch (period.toLowerCase(Locale.ROOT)) {
            case "week" -> {
                int dayOfWeek = now.getDayOfWeek().getValue(); // Mon=1..Sun=7
                OffsetDateTime weekStart = now.minusDays(dayOfWeek - 1L)
                        .withHour(0).withMinute(0).withSecond(0).withNano(0);
                OffsetDateTime weekEnd = weekStart.plusDays(6)
                        .withHour(23).withMinute(59).withSecond(59).withNano(999_000_000);
                return new OffsetDateTime[] { weekStart, weekEnd };
            }
            case "month" -> {
                OffsetDateTime monthStart = now.withDayOfMonth(1)
                        .withHour(0).withMinute(0).withSecond(0).withNano(0);
                OffsetDateTime monthEnd = monthStart
                        .withDayOfMonth(monthStart.toLocalDate().lengthOfMonth())
                        .withHour(23).withMinute(59).withSecond(59).withNano(999_000_000);
                return new OffsetDateTime[] { monthStart, monthEnd };
            }
            case "year" -> {
                OffsetDateTime yearStart = now.withDayOfYear(1)
                        .withHour(0).withMinute(0).withSecond(0).withNano(0);
                int daysInYear = now.toLocalDate().isLeapYear() ? 366 : 365;
                OffsetDateTime yearEnd = yearStart.plusDays(daysInYear - 1L)
                        .withHour(23).withMinute(59).withSecond(59).withNano(999_000_000);
                return new OffsetDateTime[] { yearStart, yearEnd };
            }
            default -> {
                return null;
            }
        }
    }
}
