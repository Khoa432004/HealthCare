package com.example.HealthCare.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettlePayrollRequest {
    @NotNull(message = "Doctor ID is required")
    private UUID doctorId;
    
    @NotNull(message = "Year is required")
    private Integer year;
    
    @NotNull(message = "Month is required")
    private Integer month;
    
    private String note; // Optional note from admin
}

