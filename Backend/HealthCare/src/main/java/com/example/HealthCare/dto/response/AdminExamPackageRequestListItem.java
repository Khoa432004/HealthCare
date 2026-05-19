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
public class AdminExamPackageRequestListItem {
	private UUID requestId;
	private UUID doctorUserId;
	private String doctorName;
	private String doctorEmail;
	private String submittedAt;
	private int packageLineCount;
}
