package com.example.HealthCare.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.AdminRejectExamPackageRequest;
import com.example.HealthCare.dto.response.AdminExamPackageRequestListItem;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.AdminDoctorExamPackageRequestService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/admin/exam-package-requests")
@RequiredArgsConstructor
@Slf4j
public class AdminDoctorExamPackageRequestController {

	private final AdminDoctorExamPackageRequestService adminDoctorExamPackageRequestService;
	private final UserAccountRepository userAccountRepository;

	@GetMapping("/pending")
	@PreAuthorize("hasAuthority('APPROVE_EXAM_PACKAGE_CONFIG')")
	public ResponseEntity<ResponseSuccess> listPending() {
		List<AdminExamPackageRequestListItem> list = adminDoctorExamPackageRequestService.listPending();
		return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "OK", list));
	}

	@GetMapping("/detail/{requestId}")
	@PreAuthorize("hasAuthority('APPROVE_EXAM_PACKAGE_CONFIG')")
	public ResponseEntity<ResponseSuccess> getPendingDetail(@PathVariable UUID requestId) {
		return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "OK",
				adminDoctorExamPackageRequestService.getPendingDetail(requestId)));
	}

	@PostMapping("/{requestId}/approve")
	@PreAuthorize("hasAuthority('APPROVE_EXAM_PACKAGE_CONFIG')")
	public ResponseEntity<ResponseSuccess> approve(@PathVariable UUID requestId) {
		UUID adminId = getCurrentUserId();
		log.info("Admin {} approving exam package request {}", adminId, requestId);
		adminDoctorExamPackageRequestService.approve(requestId, adminId);
		return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Request approved. Packages are now live."));
	}

	@PostMapping("/{requestId}/reject")
	@PreAuthorize("hasAuthority('APPROVE_EXAM_PACKAGE_CONFIG')")
	public ResponseEntity<ResponseSuccess> reject(
			@PathVariable UUID requestId,
			@RequestBody(required = false) AdminRejectExamPackageRequest body) {
		UUID adminId = getCurrentUserId();
		String note = body != null ? body.getNote() : null;
		log.info("Admin {} rejecting exam package request {}", adminId, requestId);
		adminDoctorExamPackageRequestService.reject(requestId, adminId, note);
		return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Request rejected."));
	}

	private UUID getCurrentUserId() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String email = authentication.getName();
		UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email)
				.orElseThrow(() -> new RuntimeException("User not found"));
		return user.getId();
	}
}
