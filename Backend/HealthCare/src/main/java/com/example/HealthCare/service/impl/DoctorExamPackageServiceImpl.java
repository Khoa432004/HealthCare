package com.example.HealthCare.service.impl;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.ExamPackageLineRequest;
import com.example.HealthCare.dto.request.SubmitExamPackagesRequest;
import com.example.HealthCare.dto.response.DoctorExamPackageResponse;
import com.example.HealthCare.dto.response.ExamPackagePendingResponse;
import com.example.HealthCare.dto.response.ExamPackageWorkspaceResponse;
import com.example.HealthCare.enums.DoctorPackageApprovalStatus;
import com.example.HealthCare.exception.BadRequestException;
import com.example.HealthCare.model.DoctorExamPackage;
import com.example.HealthCare.model.DoctorExamPackageRequest;
import com.example.HealthCare.repository.DoctorExamPackageRepository;
import com.example.HealthCare.repository.DoctorExamPackageRequestRepository;
import com.example.HealthCare.service.DoctorExamPackageService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorExamPackageServiceImpl implements DoctorExamPackageService {

	private static final DateTimeFormatter ISO_OFFSET = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

	private final DoctorExamPackageRepository packageRepository;
	private final DoctorExamPackageRequestRepository requestRepository;
	private final ObjectMapper objectMapper;

	@Override
	public ExamPackageWorkspaceResponse getWorkspace(UUID doctorUserId) {
		List<DoctorExamPackageResponse> approved = packageRepository.findByDoctorUserIdOrderBySortOrderAsc(doctorUserId)
				.stream()
				.map(this::toResponse)
				.toList();

		List<ExamPackagePendingResponse> pendingSubmissions = new ArrayList<>();
		List<DoctorExamPackageRequest> pendings = requestRepository
				.findByDoctorUserIdAndApprovalStatusOrderBySubmittedAtDesc(doctorUserId,
						DoctorPackageApprovalStatus.PENDING_ADMIN_APPROVAL);
		for (DoctorExamPackageRequest r : pendings) {
			try {
				List<ExamPackageLineRequest> lines = objectMapper.readValue(r.getProposedPayload(),
						new TypeReference<List<ExamPackageLineRequest>>() {
						});
				List<DoctorExamPackageResponse> plist = new ArrayList<>();
				for (int i = 0; i < lines.size(); i++) {
					plist.add(lineToResponse(lines.get(i), i));
				}
				pendingSubmissions.add(ExamPackagePendingResponse.builder()
						.requestId(r.getId())
						.submittedAt(ISO_OFFSET.format(r.getSubmittedAt()))
						.packages(plist)
						.build());
			} catch (JsonProcessingException e) {
				log.error("Failed to parse pending exam package payload for doctor {}", doctorUserId, e);
			}
		}

		return ExamPackageWorkspaceResponse.builder()
				.approvedPackages(approved)
				.pendingSubmissions(pendingSubmissions)
				.build();
	}

	@Override
	@Transactional
	public ExamPackageWorkspaceResponse submitChanges(UUID doctorUserId, SubmitExamPackagesRequest request) {
		try {
			String json = objectMapper.writeValueAsString(request.getPackages());
			OffsetDateTime now = OffsetDateTime.now();
			requestRepository.save(DoctorExamPackageRequest.builder()
					.doctorUserId(doctorUserId)
					.approvalStatus(DoctorPackageApprovalStatus.PENDING_ADMIN_APPROVAL)
					.submittedAt(now)
					.proposedPayload(json)
					.build());
		} catch (JsonProcessingException e) {
			throw new BadRequestException("Could not serialize package list.");
		} catch (Exception e) {
			log.error("Failed to save exam package request for doctor {}", doctorUserId, e);
			throw new RuntimeException("Could not save your request. Your current published packages were not changed.");
		}
		return getWorkspace(doctorUserId);
	}

	private DoctorExamPackageResponse toResponse(DoctorExamPackage e) {
		return DoctorExamPackageResponse.builder()
				.packageId(e.getId())
				.packageName(e.getPackageName())
				.durationMinutes(e.getDurationMinutes())
				.priceVnd(e.getPriceVnd())
				.applicable(Boolean.TRUE.equals(e.getApplicable()))
				.sortOrder(e.getSortOrder())
				.build();
	}

	private DoctorExamPackageResponse lineToResponse(ExamPackageLineRequest line, int sortOrder) {
		return DoctorExamPackageResponse.builder()
				.packageId(line.getPackageId())
				.packageName(line.getPackageName())
				.durationMinutes(line.getDurationMinutes())
				.priceVnd(line.getPriceVnd())
				.applicable(Boolean.TRUE.equals(line.getApplicable()))
				.sortOrder(sortOrder)
				.build();
	}
}
