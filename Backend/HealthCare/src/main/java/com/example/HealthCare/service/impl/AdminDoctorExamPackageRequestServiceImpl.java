package com.example.HealthCare.service.impl;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.ExamPackageLineRequest;
import com.example.HealthCare.dto.response.AdminExamPackageRequestListItem;
import com.example.HealthCare.dto.response.DoctorExamPackageResponse;
import com.example.HealthCare.dto.response.ExamPackageChangeRowResponse;
import com.example.HealthCare.dto.response.ExamPackageRequestDetailResponse;
import com.example.HealthCare.enums.DoctorPackageApprovalStatus;
import com.example.HealthCare.exception.BadRequestException;
import com.example.HealthCare.exception.NotFoundException;
import com.example.HealthCare.model.DoctorExamPackage;
import com.example.HealthCare.model.DoctorExamPackageRequest;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.DoctorExamPackageRepository;
import com.example.HealthCare.repository.DoctorExamPackageRequestRepository;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.AdminDoctorExamPackageRequestService;
import com.example.HealthCare.service.NotificationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminDoctorExamPackageRequestServiceImpl implements AdminDoctorExamPackageRequestService {

	private static final DateTimeFormatter ISO_OFFSET = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

	private final DoctorExamPackageRequestRepository requestRepository;
	private final DoctorExamPackageRepository packageRepository;
	private final UserAccountRepository userAccountRepository;
	private final NotificationService notificationService;
	private final ObjectMapper objectMapper;

	@Override
	public List<AdminExamPackageRequestListItem> listPending() {
		List<DoctorExamPackageRequest> pending = requestRepository
				.findByApprovalStatusOrderBySubmittedAtDesc(DoctorPackageApprovalStatus.PENDING_ADMIN_APPROVAL);
		List<AdminExamPackageRequestListItem> out = new ArrayList<>();
		for (DoctorExamPackageRequest r : pending) {
			int count = countLines(r.getProposedPayload());
			UserAccount doctor = userAccountRepository.findByIdAndIsDeletedFalse(r.getDoctorUserId()).orElse(null);
			String name = doctor != null ? doctor.getFullName() : "Unknown";
			String email = doctor != null ? doctor.getEmail() : "";
			out.add(AdminExamPackageRequestListItem.builder()
					.requestId(r.getId())
					.doctorUserId(r.getDoctorUserId())
					.doctorName(name)
					.doctorEmail(email)
					.submittedAt(ISO_OFFSET.format(r.getSubmittedAt()))
					.packageLineCount(count)
					.build());
		}
		return out;
	}

	private int countLines(String json) {
		if (json == null || json.isBlank()) {
			return 0;
		}
		try {
			List<ExamPackageLineRequest> lines = objectMapper.readValue(json, new TypeReference<List<ExamPackageLineRequest>>() {
			});
			return lines.size();
		} catch (JsonProcessingException e) {
			return 0;
		}
	}

	@Override
	public ExamPackageRequestDetailResponse getPendingDetail(UUID requestId) {
		DoctorExamPackageRequest req = requestRepository.findById(requestId)
				.orElseThrow(() -> new NotFoundException("Exam package request not found."));
		if (req.getApprovalStatus() != DoctorPackageApprovalStatus.PENDING_ADMIN_APPROVAL) {
			throw new BadRequestException("Request is not pending approval.");
		}
		UserAccount doctor = userAccountRepository.findByIdAndIsDeletedFalse(req.getDoctorUserId())
				.orElseThrow(() -> new NotFoundException("Doctor not found."));
		List<ExamPackageLineRequest> lines;
		try {
			lines = objectMapper.readValue(req.getProposedPayload(), new TypeReference<List<ExamPackageLineRequest>>() {
			});
		} catch (JsonProcessingException e) {
			throw new BadRequestException("Invalid stored proposal.");
		}

		List<DoctorExamPackage> published = packageRepository.findByDoctorUserIdOrderBySortOrderAsc(req.getDoctorUserId());
		Map<UUID, DoctorExamPackage> publishedById = new HashMap<>();
		for (DoctorExamPackage p : published) {
			publishedById.put(p.getId(), p);
		}

		Set<UUID> proposedPackageIds = new HashSet<>();
		for (ExamPackageLineRequest line : lines) {
			if (line.getPackageId() != null) {
				proposedPackageIds.add(line.getPackageId());
			}
		}

		List<ExamPackageChangeRowResponse> changes = new ArrayList<>();
		int unchanged = 0;

		for (int i = 0; i < lines.size(); i++) {
			ExamPackageLineRequest line = lines.get(i);
			DoctorExamPackageResponse proposed = fromLineRequest(line, i);
			if (line.getPackageId() == null) {
				changes.add(ExamPackageChangeRowResponse.builder()
						.changeType("ADDED")
						.proposed(proposed)
						.build());
				continue;
			}
			DoctorExamPackage existing = publishedById.get(line.getPackageId());
			if (existing == null) {
				changes.add(ExamPackageChangeRowResponse.builder()
						.changeType("ADDED")
						.proposed(proposed)
						.build());
				continue;
			}
			if (samePublishedContent(existing, line)) {
				unchanged++;
				continue;
			}
			changes.add(ExamPackageChangeRowResponse.builder()
					.changeType("MODIFIED")
					.previous(entityToResponse(existing))
					.proposed(proposed)
					.build());
		}

		for (DoctorExamPackage pub : published) {
			if (!proposedPackageIds.contains(pub.getId())) {
				changes.add(ExamPackageChangeRowResponse.builder()
						.changeType("REMOVED")
						.previous(entityToResponse(pub))
						.build());
			}
		}

		return ExamPackageRequestDetailResponse.builder()
				.requestId(req.getId())
				.doctorUserId(req.getDoctorUserId())
				.doctorName(doctor.getFullName())
				.doctorEmail(doctor.getEmail())
				.submittedAt(ISO_OFFSET.format(req.getSubmittedAt()))
				.changes(changes)
				.unchangedPublishedCount(unchanged)
				.build();
	}

	private static boolean samePublishedContent(DoctorExamPackage pub, ExamPackageLineRequest line) {
		String name = line.getPackageName() != null ? line.getPackageName().trim() : "";
		if (!pub.getPackageName().trim().equals(name)) {
			return false;
		}
		if (!pub.getDurationDays().equals(line.getDurationDays())) {
			return false;
		}
		if (!pub.getPriceVnd().equals(line.getPriceVnd())) {
			return false;
		}
		boolean pubApp = Boolean.TRUE.equals(pub.getApplicable());
		boolean lineApp = Boolean.TRUE.equals(line.getApplicable());
		return pubApp == lineApp;
	}

	private static DoctorExamPackageResponse entityToResponse(DoctorExamPackage e) {
		return DoctorExamPackageResponse.builder()
				.packageId(e.getId())
				.packageName(e.getPackageName())
				.durationDays(e.getDurationDays())
				.priceVnd(e.getPriceVnd())
				.applicable(Boolean.TRUE.equals(e.getApplicable()))
				.sortOrder(e.getSortOrder())
				.build();
	}

	private static DoctorExamPackageResponse fromLineRequest(ExamPackageLineRequest line, int sortOrder) {
		return DoctorExamPackageResponse.builder()
				.packageId(line.getPackageId())
				.packageName(line.getPackageName())
				.durationDays(line.getDurationDays())
				.priceVnd(line.getPriceVnd())
				.applicable(Boolean.TRUE.equals(line.getApplicable()))
				.sortOrder(sortOrder)
				.build();
	}

	@Override
	@Transactional
	public void approve(UUID requestId, UUID adminUserId) {
		DoctorExamPackageRequest req = requestRepository.findById(requestId)
				.orElseThrow(() -> new NotFoundException("Exam package request not found."));
		if (req.getApprovalStatus() != DoctorPackageApprovalStatus.PENDING_ADMIN_APPROVAL) {
			throw new BadRequestException("Request is not pending approval.");
		}
		List<ExamPackageLineRequest> lines;
		try {
			lines = objectMapper.readValue(req.getProposedPayload(), new TypeReference<List<ExamPackageLineRequest>>() {
			});
		} catch (JsonProcessingException e) {
			throw new BadRequestException("Invalid stored proposal.");
		}
		if (lines.isEmpty()) {
			throw new BadRequestException("Proposal contains no packages.");
		}
		UUID doctorId = req.getDoctorUserId();
		packageRepository.deleteByDoctorUserId(doctorId);
		packageRepository.flush();
		int order = 0;
		for (ExamPackageLineRequest line : lines) {
			if (line.getPackageName() == null || line.getPackageName().isBlank()) {
				throw new BadRequestException("Package name is required for each line.");
			}
			DoctorExamPackage p = DoctorExamPackage.builder()
					.doctorUserId(doctorId)
					.packageName(line.getPackageName().trim())
					.durationDays(line.getDurationDays())
					.priceVnd(line.getPriceVnd())
					.applicable(Boolean.TRUE.equals(line.getApplicable()))
					.sortOrder(order++)
					.build();
			packageRepository.save(p);
		}
		req.setApprovalStatus(DoctorPackageApprovalStatus.APPROVED);
		req.setReviewedAt(OffsetDateTime.now());
		req.setReviewedBy(adminUserId);
		requestRepository.save(req);

		String title = "Yêu cầu cấu hình gói khám đã được duyệt";
		String body = "Yêu cầu cấu hình gói khám của bạn đã được quản trị viên phê duyệt. "
				+ "Danh sách gói khám mới đã được áp dụng cho bệnh nhân.";
		try {
			notificationService.notifySingleUser(doctorId, title, body, "ADMIN", adminUserId);
		} catch (Exception e) {
			log.warn("Could not notify doctor {} about exam package approval: {}", doctorId, e.getMessage());
		}
	}

	@Override
	@Transactional
	public void reject(UUID requestId, UUID adminUserId, String note) {
		DoctorExamPackageRequest req = requestRepository.findById(requestId)
				.orElseThrow(() -> new NotFoundException("Exam package request not found."));
		if (req.getApprovalStatus() != DoctorPackageApprovalStatus.PENDING_ADMIN_APPROVAL) {
			throw new BadRequestException("Request is not pending approval.");
		}
		req.setApprovalStatus(DoctorPackageApprovalStatus.REJECTED);
		req.setReviewedAt(OffsetDateTime.now());
		req.setReviewedBy(adminUserId);
		req.setAdminNote(note != null && note.length() > 2000 ? note.substring(0, 2000) : note);
		requestRepository.save(req);

		UUID doctorId = req.getDoctorUserId();
		String title = "Từ chối yêu cầu cấu hình gói khám";
		StringBuilder body = new StringBuilder();
		body.append("Yêu cầu chỉnh sửa/thêm gói khám của bạn đã bị quản trị viên từ chối. ");
		body.append("Các gói khám đang áp dụng trên hệ thống không thay đổi.");
		if (note != null && !note.isBlank()) {
			body.append("\n\nLý do: ").append(note.trim());
		}
		try {
			notificationService.notifySingleUser(doctorId, title, body.toString(), "ADMIN", adminUserId);
		} catch (Exception e) {
			log.warn("Could not notify doctor {} about exam package rejection: {}", doctorId, e.getMessage());
		}
	}
}
