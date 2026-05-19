package com.example.HealthCare.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.SubmitExamPackagesRequest;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.DoctorExamPackageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/doctors/me/exam-packages")
@RequiredArgsConstructor
@Slf4j
public class DoctorExamPackageController {

	private final DoctorExamPackageService doctorExamPackageService;
	private final UserAccountRepository userAccountRepository;

	@GetMapping
	@PreAuthorize("hasAuthority('CONFIGURE_EXAM_PACKAGE')")
	public ResponseEntity<ResponseSuccess> getWorkspace() {
		UUID doctorUserId = getCurrentUserId();
		return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "OK",
				doctorExamPackageService.getWorkspace(doctorUserId)));
	}

	@PostMapping("/submit")
	@PreAuthorize("hasAuthority('CONFIGURE_EXAM_PACKAGE')")
	public ResponseEntity<ResponseSuccess> submit(@Valid @RequestBody SubmitExamPackagesRequest request) {
		UUID doctorUserId = getCurrentUserId();
		log.info("Doctor {} submitted exam package change request", doctorUserId);
		return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK,
				"Your changes have been submitted for admin approval.",
				doctorExamPackageService.submitChanges(doctorUserId, request)));
	}

	private UUID getCurrentUserId() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String email = authentication.getName();
		UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email)
				.orElseThrow(() -> new RuntimeException("User not found"));
		return user.getId();
	}
}
