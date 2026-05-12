package com.example.HealthCare.dto.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorExamPackageResponse {
	private UUID packageId;
	private String packageName;
	private int durationMinutes;
	private long priceVnd;
	private boolean applicable;
	private Integer sortOrder;
}
