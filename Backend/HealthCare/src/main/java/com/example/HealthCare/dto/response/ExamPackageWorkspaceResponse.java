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
public class ExamPackageWorkspaceResponse {
	private List<DoctorExamPackageResponse> approvedPackages;
	/** All pending approval submissions for this doctor (newest first). */
	private List<ExamPackagePendingResponse> pendingSubmissions;
}
