package com.example.HealthCare.dto.request;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardFilterRequest {
    private String period; // "today", "week", "month", "year", "custom"
    private LocalDate fromDate; // For custom period
    private LocalDate toDate; // For custom period
}

