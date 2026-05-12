package com.example.HealthCare.model;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.HealthCare.enums.DoctorPackageApprovalStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "doctor_exam_package_request")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class DoctorExamPackageRequest extends BaseEntity {

	@Column(name = "doctor_user_id", nullable = false)
	private UUID doctorUserId;

	@Column(name = "approval_status", nullable = false, length = 32)
	@Enumerated(EnumType.STRING)
	@lombok.Builder.Default
	private DoctorPackageApprovalStatus approvalStatus = DoctorPackageApprovalStatus.PENDING_ADMIN_APPROVAL;

	@Column(name = "submitted_at", nullable = false)
	private OffsetDateTime submittedAt;

	@Column(name = "reviewed_at")
	private OffsetDateTime reviewedAt;

	@Column(name = "reviewed_by")
	private UUID reviewedBy;

	@Column(name = "admin_note", length = 2000)
	private String adminNote;

	@Column(name = "proposed_payload", nullable = false, columnDefinition = "TEXT")
	private String proposedPayload;
}
