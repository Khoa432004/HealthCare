package com.example.HealthCare.dto.request;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWorkScheduleRequest {
    
    @NotNull(message = "Session duration is required")
    @Min(value = 10, message = "Session duration must be at least 10 minutes")
    private Integer sessionDuration; // 10, 15, 20, 30, 60
    
    @NotNull(message = "Appointment cost is required")
    @Min(value = 0, message = "Appointment cost must be greater than or equal to 0")
    private BigDecimal appointmentCost;
    
    @Valid
    private List<DayScheduleRequest> days;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayScheduleRequest {
        @NotNull(message = "Weekday is required")
        private Short weekday; // 1 = Monday, 7 = Sunday
        
        @NotNull(message = "Enabled status is required")
        private Boolean enabled;
        
        @Valid
        private List<TimeSlotRequest> timeSlots;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSlotRequest {
        @NotNull(message = "Start time is required")
        private String startTime; // HH:mm format
        
        @NotNull(message = "End time is required")
        private String endTime; // HH:mm format
    }
}

