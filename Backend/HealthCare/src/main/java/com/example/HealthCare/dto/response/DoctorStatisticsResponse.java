package com.example.HealthCare.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorStatisticsResponse {
    // KPI Cards
    private Long totalPatientsToday; // Tổng BN hôm nay
    private Long completedAppointments; // Ca khám đã hoàn thành
    private Long pendingReportAppointments; // Ca khám chờ báo cáo
    private BigDecimal dailyRevenue; // Doanh thu trong ngày (VND)
    
    // Pending Reports Table
    private List<PendingReportAppointmentResponse> pendingReports;
}

