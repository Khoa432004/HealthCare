package com.example.HealthCare.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import org.springframework.stereotype.Service;

import com.example.HealthCare.dto.request.DashboardFilterRequest;
import com.example.HealthCare.dto.response.DashboardStatsResponse;
import com.example.HealthCare.enums.AppointmentStatus;
import com.example.HealthCare.enums.PaymentStatus;
import com.example.HealthCare.enums.RequestStatus;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.repository.ApprovalRequestRepository;
import com.example.HealthCare.repository.PaymentRepository;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.DashboardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final UserAccountRepository userAccountRepository;
    private final ApprovalRequestRepository approvalRequestRepository;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public DashboardStatsResponse getDashboardStats(DashboardFilterRequest filter) {
        // Calculate date range based on filter
        OffsetDateTime[] dateRange = calculateDateRange(filter);
        OffsetDateTime fromDate = dateRange[0];
        OffsetDateTime toDate = dateRange[1];

        log.info("Getting dashboard stats from {} to {}", fromDate, toDate);
        log.info("Period filter: {}", filter.getPeriod());

        // Total users (all time, not filtered by date)
        Long totalUsers = userAccountRepository.countByIsDeletedFalse();
        log.info("Total users: {}", totalUsers);

        // Pending doctors (all time, not filtered by date)
        Long pendingDoctors = approvalRequestRepository.countByStatus(RequestStatus.PENDING);

        // Total appointments in period
        Long totalAppointments = appointmentRepository.countByCreatedAtBetween(fromDate, toDate);
        log.info("Total appointments in period: {}", totalAppointments);

        // Completed appointments in period
        Long completedAppointments = appointmentRepository.countByStatusAndCreatedAtBetween(
                AppointmentStatus.COMPLETED, fromDate, toDate);
        log.info("Completed appointments: {}", completedAppointments);

        // Canceled appointments in period
        Long canceledAppointments = appointmentRepository.countByStatusAndCreatedAtBetween(
                AppointmentStatus.CANCELED, fromDate, toDate);
        log.info("Canceled appointments: {}", canceledAppointments);

        // Scheduled appointments in period
        Long scheduledAppointments = appointmentRepository.countByStatusAndCreatedAtBetween(
                AppointmentStatus.SCHEDULED, fromDate, toDate);
        log.info("Scheduled appointments: {}", scheduledAppointments);

        // Revenue from completed appointments in period
        BigDecimal revenue = paymentRepository.sumTotalAmountByStatusAndPaymentTimeBetween(
                PaymentStatus.PAID, fromDate, toDate);
        log.info("Revenue from payments with status PAID: {}", revenue);
        
        if (revenue == null) {
            revenue = BigDecimal.ZERO;
        }

        // Calculate doctor salaries (85% of revenue)
        BigDecimal doctorSalaries = revenue.multiply(new BigDecimal("0.85"))
                .setScale(2, RoundingMode.HALF_UP);

        // Calculate platform profit (15% of revenue)
        BigDecimal platformProfit = revenue.multiply(new BigDecimal("0.15"))
                .setScale(2, RoundingMode.HALF_UP);

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .pendingDoctors(pendingDoctors)
                .totalAppointments(totalAppointments)
                .revenue(revenue)
                .doctorSalaries(doctorSalaries)
                .platformProfit(platformProfit)
                .completedAppointments(completedAppointments)
                .canceledAppointments(canceledAppointments)
                .scheduledAppointments(scheduledAppointments)
                .build();
    }

    private OffsetDateTime[] calculateDateRange(DashboardFilterRequest filter) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime fromDate;
        OffsetDateTime toDate = now;

        String period = filter.getPeriod() != null ? filter.getPeriod().toLowerCase() : "week";

        switch (period) {
            case "today":
                fromDate = now.toLocalDate().atStartOfDay().atOffset(ZoneOffset.UTC);
                toDate = now;
                break;
            case "week":
                // This week (Monday to now)
                fromDate = now.toLocalDate()
                        .minusDays(now.getDayOfWeek().getValue() - 1)
                        .atStartOfDay()
                        .atOffset(ZoneOffset.UTC);
                break;
            case "month":
                // This month
                fromDate = now.toLocalDate()
                        .withDayOfMonth(1)
                        .atStartOfDay()
                        .atOffset(ZoneOffset.UTC);
                break;
            case "year":
                // This year
                fromDate = now.toLocalDate()
                        .withDayOfYear(1)
                        .atStartOfDay()
                        .atOffset(ZoneOffset.UTC);
                break;
            case "custom":
                if (filter.getFromDate() != null && filter.getToDate() != null) {
                    fromDate = filter.getFromDate().atStartOfDay().atOffset(ZoneOffset.UTC);
                    toDate = filter.getToDate().atTime(23, 59, 59).atOffset(ZoneOffset.UTC);
                } else {
                    // Default to this week if custom dates not provided
                    fromDate = now.toLocalDate()
                            .minusDays(now.getDayOfWeek().getValue() - 1)
                            .atStartOfDay()
                            .atOffset(ZoneOffset.UTC);
                }
                break;
            default:
                // Default to this week
                fromDate = now.toLocalDate()
                        .minusDays(now.getDayOfWeek().getValue() - 1)
                        .atStartOfDay()
                        .atOffset(ZoneOffset.UTC);
        }

        return new OffsetDateTime[]{fromDate, toDate};
    }
}

