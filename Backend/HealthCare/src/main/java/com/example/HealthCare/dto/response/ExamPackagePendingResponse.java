package com.example.HealthCare.dto.response;

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
public class ExamPackagePendingResponse {
	private UUID requestId;
	private String submittedAt;
	private List<DoctorExamPackageResponse> packages;
}
