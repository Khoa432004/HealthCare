package com.example.HealthCare.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorPayrollResponse {
    private UUID doctorId;
    private String doctorName;
    private String email;
    private String phoneNumber;
    private Integer completedAppointments; // Số lịch khám hoàn thành
    private BigDecimal totalRevenue; // Tổng doanh thu (Gross)
    private BigDecimal refunds; // Tổng số tiền đã hoàn
    private BigDecimal platformFee; // 15% phí nền tảng
    private BigDecimal doctorSalary; // 85% lương bác sĩ (Net)
    private String paymentStatus; // SETTLED, UNSETTLED
    private UUID payrollId; // ID của bản ghi payroll nếu đã tạo
    private boolean canSettle; // Có thể thanh toán hay chưa (dựa vào ngày)
}

