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
public class WorkScheduleResponse {
    private Integer sessionDuration;
    private BigDecimal appointmentCost;
    private List<DayScheduleResponse> days;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayScheduleResponse {
        private Short weekday;
        private Boolean enabled;
        private List<TimeSlotResponse> timeSlots;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSlotResponse {
        private String startTime;
        private String endTime;
    }
}

