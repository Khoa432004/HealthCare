package com.example.HealthCare.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Long totalUsers;
    private Long pendingDoctors;
    private Long totalAppointments;
    private BigDecimal revenue; // Doanh thu từ lịch hẹn
    private BigDecimal doctorSalaries; // Tổng lương trả cho bác sĩ (85% revenue)
    private BigDecimal platformProfit; // Lợi nhuận nền tảng (15% revenue)
    
    // Additional stats
    private Long completedAppointments;
    private Long canceledAppointments;
    private Long scheduledAppointments;
}

