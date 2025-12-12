package com.example.HealthCare.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotsResponse {
    private List<TimeSlot> availableSlots;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSlot {
        private String startTime; // ISO format: "2025-01-15T14:00:00+07:00"
        private String endTime;   // ISO format: "2025-01-15T14:30:00+07:00"
        private String displayTime; // Display format: "14:00"
    }
}

