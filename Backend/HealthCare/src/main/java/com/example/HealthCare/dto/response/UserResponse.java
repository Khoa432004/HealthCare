package com.example.HealthCare.dto.response;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
	private UUID id;
	private String email;
	private String fullName;
	private String phoneNumber;
	private String gender; // Gender enum as string
	private LocalDate dateOfBirth;
	private String role; // UserRole enum as string
	private String status; // AccountStatus enum as string
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;
	private String approvalRequestStatus; // ApprovalRequest status (PENDING, APPROVED, REJECTED) - only for doctors
	
	// Deprecated fields (for backward compatibility, if needed)
	@Deprecated
	private String username; // Maps to email
	@Deprecated
	private String phone; // Maps to phoneNumber
	@Deprecated
	private String roleName; // Maps to role
}
