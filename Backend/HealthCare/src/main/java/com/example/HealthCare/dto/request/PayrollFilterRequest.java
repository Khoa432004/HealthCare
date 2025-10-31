package com.example.HealthCare.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollFilterRequest {
    private Integer year;
    private Integer month;
    private String search; // Search by doctor name, email, phone
}

