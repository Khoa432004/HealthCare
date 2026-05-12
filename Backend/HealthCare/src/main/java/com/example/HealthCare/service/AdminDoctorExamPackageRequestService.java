package com.example.HealthCare.service;

import java.util.List;
import java.util.UUID;

import com.example.HealthCare.dto.response.AdminExamPackageRequestListItem;
import com.example.HealthCare.dto.response.ExamPackageRequestDetailResponse;

public interface AdminDoctorExamPackageRequestService {

	List<AdminExamPackageRequestListItem> listPending();

	ExamPackageRequestDetailResponse getPendingDetail(UUID requestId);

	void approve(UUID requestId, UUID adminUserId);

	void reject(UUID requestId, UUID adminUserId, String note);
}
