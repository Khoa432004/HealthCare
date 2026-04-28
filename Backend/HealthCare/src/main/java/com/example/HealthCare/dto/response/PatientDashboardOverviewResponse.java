package com.example.HealthCare.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDashboardOverviewResponse {
    private List<MetricCardItem> metricCards;
    private List<MetricTrendPoint> glucoseTrend;
    private CurrentPlan currentPlan;
    private List<MedicineScheduleItem> todayMedicines;
    private AppointmentItem pendingAppointment;
    private List<AppointmentItem> weeklyAppointments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetricCardItem {
        private String name;
        private BigDecimal value;
        private String unit;
        private String status;
        private String deltaText;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetricTrendPoint {
        private String day;
        private BigDecimal value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrentPlan {
        private String title;
        private String status;
        private Integer progressPercent;
        private Integer daysLeft;
        private String appointmentSummary;
        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicineScheduleItem {
        private String time;
        private String drugName;
        private String dosage;
        private String instruction;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppointmentItem {
        private UUID id;
        private String day;
        private String date;
        private String doctor;
        private String time;
    }
}
