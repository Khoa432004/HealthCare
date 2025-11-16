package com.example.HealthCare.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.DoctorStatisticsFilterRequest;
import com.example.HealthCare.dto.response.DoctorStatisticsResponse;
import com.example.HealthCare.dto.response.PendingReportAppointmentResponse;
import com.example.HealthCare.enums.AppointmentStatus;
import com.example.HealthCare.enums.ReportStatus;
import com.example.HealthCare.model.Appointment;
import com.example.HealthCare.model.MedicalReport;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.repository.DoctorScheduleRuleRepository;
import com.example.HealthCare.repository.MedicalReportRepository;
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

        return DoctorStatisticsResponse.builder()
            .totalPatientsToday(totalPatientsToday)
            .completedAppointments(completedAppointments)
            .pendingReportAppointments(pendingReportAppointmentsCount)
            .dailyRevenue(dailyRevenue.setScale(2, RoundingMode.HALF_UP))
            .pendingReports(pendingReports)
            .build();
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

