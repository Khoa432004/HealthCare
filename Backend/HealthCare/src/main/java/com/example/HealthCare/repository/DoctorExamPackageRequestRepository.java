package com.example.HealthCare.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.HealthCare.enums.DoctorPackageApprovalStatus;
import com.example.HealthCare.model.DoctorExamPackageRequest;

public interface DoctorExamPackageRequestRepository extends JpaRepository<DoctorExamPackageRequest, UUID> {

	Optional<DoctorExamPackageRequest> findByDoctorUserIdAndApprovalStatus(UUID doctorUserId,
			DoctorPackageApprovalStatus approvalStatus);

	List<DoctorExamPackageRequest> findByDoctorUserIdAndApprovalStatusOrderBySubmittedAtDesc(UUID doctorUserId,
			DoctorPackageApprovalStatus approvalStatus);

	List<DoctorExamPackageRequest> findByApprovalStatusOrderBySubmittedAtDesc(DoctorPackageApprovalStatus status);
}
