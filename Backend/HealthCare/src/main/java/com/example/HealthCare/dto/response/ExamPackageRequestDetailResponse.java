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
public class ExamPackageRequestDetailResponse {
	private UUID requestId;
	private UUID doctorUserId;
	private String doctorName;
	private String doctorEmail;
	private String submittedAt;
	/** Only packages added, edited, or removed vs current published list — not the full proposal. */
	private List<ExamPackageChangeRowResponse> changes;
	/** Published packages that appear unchanged in this proposal (same id + same fields). */
	private int unchangedPublishedCount;
}
