package com.example.HealthCare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One row in the admin review: how this request differs from currently published packages.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamPackageChangeRowResponse {

	/** ADDED, MODIFIED, REMOVED */
	private String changeType;

	/** Published row before change — present for MODIFIED and REMOVED. */
	private DoctorExamPackageResponse previous;

	/** Proposed row — present for ADDED and MODIFIED. */
	private DoctorExamPackageResponse proposed;
}
