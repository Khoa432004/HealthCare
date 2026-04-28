package com.example.HealthCare.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.DoctorStatisticsFilterRequest;
import com.example.HealthCare.dto.response.CriticalCaseResponse;
import com.example.HealthCare.dto.response.DoctorStatisticsResponse;
import com.example.HealthCare.dto.response.PendingReportAppointmentResponse;
import com.example.HealthCare.enums.AppointmentStatus;
import com.example.HealthCare.enums.MealContext;
import com.example.HealthCare.enums.MeasurementBadge;
import com.example.HealthCare.enums.ReportStatus;
import com.example.HealthCare.model.Appointment;
import com.example.HealthCare.model.MedicalReport;
import com.example.HealthCare.model.PatientVitalMeasurement;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.repository.DoctorScheduleRuleRepository;
import com.example.HealthCare.repository.MedicalReportRepository;
import com.example.HealthCare.repository.PatientVitalMeasurementRepository;
import com.example.HealthCare.service.DoctorStatisticsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorStatisticsServiceImpl implements DoctorStatisticsService {

    private final AppointmentRepository appointmentRepository;
    private final MedicalReportRepository medicalReportRepository;
    private final DoctorScheduleRuleRepository doctorScheduleRuleRepository;
    private final PatientVitalMeasurementRepository patientVitalMeasurementRepository;

    @Override
    @Transactional(readOnly = true)
    public DoctorStatisticsResponse getDoctorStatistics(UUID doctorId, DoctorStatisticsFilterRequest filter) {
        // Calculate date range based on filter
        OffsetDateTime[] dateRange = calculateDateRange(filter);
        OffsetDateTime fromDate = dateRange[0];
        OffsetDateTime toDate = dateRange[1];
        
        log.debug("Doctor statistics query - DoctorId: {}, Period: {}, FromDate: {}, ToDate: {}", 
            doctorId, filter.getPeriod(), fromDate, toDate);

        // KPI 1: Tổng BN hôm nay = số bệnh nhân duy nhất có lịch của bác sĩ trong ngày
        Long totalPatientsToday = appointmentRepository.countDistinctPatientsByDoctorIdAndDateRange(
            doctorId, fromDate, toDate);

        // KPI 2: Ca khám đã hoàn thành = số Appointment có status=COMPLETED trong ngày
        Long completedAppointments = appointmentRepository.countCompletedAppointmentsByDoctorIdAndDateRange(
            doctorId, AppointmentStatus.COMPLETED, fromDate, toDate);

        // KPI 3: Ca khám chờ báo cáo = số Appointment trong date range
        // mà report.status ≠ COMPLETED và status = IN-PROCESS
        // Lấy tất cả appointments trong date range, không chỉ những cái đã đến giờ
        List<Appointment> pendingReportAppointments = appointmentRepository.findPendingReportAppointments(
            doctorId, 
            AppointmentStatus.IN_PROCESS, 
            ReportStatus.COMPLETED,
            fromDate, 
            toDate
        );
        Long pendingReportAppointmentsCount = (long) pendingReportAppointments.size();

        // KPI 4: Doanh thu trong ngày (VND)
        // Doanh thu = số appointment đã completed * appointment_cost (từ doctor_schedule_rule) - 15% phí nền tảng
        BigDecimal appointmentCost = doctorScheduleRuleRepository.getAverageAppointmentCostByDoctorId(doctorId);
        if (appointmentCost == null) {
            appointmentCost = new BigDecimal("150000"); // Default cost
        }
        
        // Calculate revenue: completedAppointments * appointmentCost * 0.85 (after 15% platform fee)
        BigDecimal grossRevenue = appointmentCost.multiply(new BigDecimal(completedAppointments));
        BigDecimal platformFeePercentage = new BigDecimal("0.15");
        BigDecimal platformFee = grossRevenue.multiply(platformFeePercentage);
        BigDecimal dailyRevenue = grossRevenue.subtract(platformFee);
        
        if (dailyRevenue == null) {
            dailyRevenue = BigDecimal.ZERO;
        }

        // Map pending appointments to response DTOs
        List<PendingReportAppointmentResponse> pendingReports = pendingReportAppointments.stream()
            .map(appointment -> {
                MedicalReport report = medicalReportRepository.findByAppointmentId(appointment.getId())
                    .orElse(null);
                
                return PendingReportAppointmentResponse.builder()
                    .appointmentId(appointment.getId())
                    .patientName(appointment.getPatient() != null ? appointment.getPatient().getFullName() : "N/A")
                    .patientPhone(appointment.getPatient() != null ? appointment.getPatient().getPhoneNumber() : "N/A")
                    .scheduledStart(appointment.getScheduledStart())
                    .status(appointment.getStatus().getValue())
                    .medicalReportId(report != null ? report.getId() : null)
                    .build();
            })
            .collect(Collectors.toList());

        List<CriticalCaseResponse> criticalCases = buildTopCriticalCases(doctorId);

        return DoctorStatisticsResponse.builder()
            .totalPatientsToday(totalPatientsToday)
            .completedAppointments(completedAppointments)
            .pendingReportAppointments(pendingReportAppointmentsCount)
            .dailyRevenue(dailyRevenue.setScale(2, RoundingMode.HALF_UP))
            .pendingReports(pendingReports)
            .criticalCases(criticalCases)
            .build();
    }

    private List<CriticalCaseResponse> buildTopCriticalCases(UUID doctorId) {
        List<UUID> patientIds = appointmentRepository.findDistinctPatientIdsByDoctorId(doctorId);
        if (patientIds == null || patientIds.isEmpty()) {
            return List.of();
        }

        List<PatientVitalMeasurement> abnormalMeasurements = patientVitalMeasurementRepository.findRecentAbnormalByPatientIds(
            patientIds,
            Arrays.asList(MeasurementBadge.HIGH, MeasurementBadge.LOW),
            PageRequest.of(0, 100)
        );

        if (abnormalMeasurements == null || abnormalMeasurements.isEmpty()) {
            return List.of();
        }

        List<CriticalCaseResponse> latestUniqueByPatient = new ArrayList<>();
        Set<UUID> seenPatientIds = new HashSet<>();

        for (PatientVitalMeasurement measurement : abnormalMeasurements) {
            UUID patientId = measurement.getPatientId();
            if (patientId == null || seenPatientIds.contains(patientId)) {
                continue;
            }

            latestUniqueByPatient.add(CriticalCaseResponse.builder()
                .patientId(patientId)
                .patientName(
                    measurement.getPatient() != null && measurement.getPatient().getFullName() != null
                        ? measurement.getPatient().getFullName()
                        : "N/A"
                )
                .metricType(measurement.getMetricType() != null ? measurement.getMetricType().name() : "N/A")
                .result(formatResult(measurement))
                .status(resolveBadge(measurement).name())
                .mealTime(formatMealTime(measurement.getMeal()))
                .takenAt(measurement.getTakenAt())
                .build());
            seenPatientIds.add(patientId);

            if (latestUniqueByPatient.size() >= 5) {
                break;
            }
        }

        return latestUniqueByPatient;
    }

    private MeasurementBadge resolveBadge(PatientVitalMeasurement measurement) {
        if (measurement.getBadge() == MeasurementBadge.HIGH || measurement.getBadge() == MeasurementBadge.LOW) {
            return measurement.getBadge();
        }
        if (measurement.getPulseBadge() == MeasurementBadge.HIGH || measurement.getPulseBadge() == MeasurementBadge.LOW) {
            return measurement.getPulseBadge();
        }
        return MeasurementBadge.NORMAL;
    }

    private String formatMealTime(MealContext mealContext) {
        if (mealContext == null) {
            return "N/A";
        }
        if (mealContext == MealContext.BEFORE_MEAL) {
            return "Before meal";
        }
        if (mealContext == MealContext.AFTER_MEAL) {
            return "After meal";
        }
        return "N/A";
    }

    private String formatResult(PatientVitalMeasurement measurement) {
        if (measurement.getSystolicValue() != null && measurement.getDiastolicValue() != null) {
            String base = measurement.getSystolicValue().stripTrailingZeros().toPlainString()
                + "/"
                + measurement.getDiastolicValue().stripTrailingZeros().toPlainString();
            if (measurement.getUnit() == null || measurement.getUnit().isBlank()) {
                return base;
            }
            return base + " " + measurement.getUnit();
        }

        if (measurement.getNumericValue() != null) {
            String base = measurement.getNumericValue().stripTrailingZeros().toPlainString();
            if (measurement.getUnit() == null || measurement.getUnit().isBlank()) {
                return base;
            }
            return base + " " + measurement.getUnit();
        }

        return "N/A";
    }

    private OffsetDateTime[] calculateDateRange(DoctorStatisticsFilterRequest filter) {
        OffsetDateTime now = OffsetDateTime.now();
        // Use the same timezone offset as the current time
        ZoneOffset currentOffset = now.getOffset();
        OffsetDateTime fromDate;
        OffsetDateTime toDate;

        String period = filter.getPeriod() != null ? filter.getPeriod().toLowerCase() : "today";

        switch (period) {
            case "today":
                // Start of today to end of today in current timezone
                fromDate = now.toLocalDate().atStartOfDay().atOffset(currentOffset);
                toDate = now.toLocalDate().atTime(23, 59, 59, 999_000_000).atOffset(currentOffset);
                break;
            case "yesterday":
                fromDate = now.toLocalDate().minusDays(1).atStartOfDay().atOffset(currentOffset);
                toDate = now.toLocalDate().minusDays(1).atTime(23, 59, 59, 999_000_000).atOffset(currentOffset);
                break;
            case "last7days":
                fromDate = now.toLocalDate().minusDays(7).atStartOfDay().atOffset(currentOffset);
                toDate = now.toLocalDate().atTime(23, 59, 59, 999_000_000).atOffset(currentOffset);
                break;
            case "thismonth":
                fromDate = now.toLocalDate()
                        .withDayOfMonth(1)
                        .atStartOfDay()
                        .atOffset(currentOffset);
                toDate = now.toLocalDate().atTime(23, 59, 59, 999_000_000).atOffset(currentOffset);
                break;
            case "custom":
                if (filter.getFromDate() != null && filter.getToDate() != null) {
                    fromDate = filter.getFromDate().atStartOfDay().atOffset(currentOffset);
                    toDate = filter.getToDate().atTime(23, 59, 59, 999_000_000).atOffset(currentOffset);
                } else {
                    // Default to today if custom dates not provided
                    fromDate = now.toLocalDate().atStartOfDay().atOffset(currentOffset);
                    toDate = now.toLocalDate().atTime(23, 59, 59, 999_000_000).atOffset(currentOffset);
                }
                break;
            default:
                // Default to today (full day)
                fromDate = now.toLocalDate().atStartOfDay().atOffset(currentOffset);
                toDate = now.toLocalDate().atTime(23, 59, 59, 999_000_000).atOffset(currentOffset);
        }

        return new OffsetDateTime[]{fromDate, toDate};
    }
}

