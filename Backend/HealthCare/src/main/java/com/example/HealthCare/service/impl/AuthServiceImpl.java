package com.example.HealthCare.service.impl;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.HealthCare.dto.request.ChangePasswordRequest;
import com.example.HealthCare.dto.request.FirstLoginPasswordChangeRequest;
import com.example.HealthCare.dto.request.PersonalInfoRequest;
import com.example.HealthCare.dto.request.ProfessionalInfoRequest;
import com.example.HealthCare.dto.request.RegisterRequest;
import com.example.HealthCare.dto.response.PersonalInfoResponse;
import com.example.HealthCare.enums.AccountStatus;
import com.example.HealthCare.enums.RequestStatus;
import com.example.HealthCare.enums.UserRole;
import com.example.HealthCare.exception.BadRequestException;
import com.example.HealthCare.exception.UsernameIsExistException;
import com.example.HealthCare.model.ApprovalRequest;
import com.example.HealthCare.model.DoctorExperience;
import com.example.HealthCare.model.DoctorProfile;
import com.example.HealthCare.model.OtpToken;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.ApprovalRequestRepository;
import com.example.HealthCare.repository.DoctorExperienceRepository;
import com.example.HealthCare.repository.DoctorProfileRepository;
import com.example.HealthCare.repository.OtpTokenRepository;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.security.JwtUtil;
import com.example.HealthCare.security.TokenBlacklistService;
import com.example.HealthCare.service.AuthService;
import com.example.HealthCare.service.EmailService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;
	private final UserAccountRepository userAccountRepository;
	private final OtpTokenRepository otpTokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final TokenBlacklistService tokenBlacklistService;
	private final EmailService emailService;
	private final DoctorProfileRepository doctorProfileRepository;
	private final DoctorExperienceRepository doctorExperienceRepository;
	private final ApprovalRequestRepository approvalRequestRepository;

	public AuthServiceImpl(AuthenticationManager authenticationManager, JwtUtil jwtUtil,
						  UserAccountRepository userAccountRepository, OtpTokenRepository otpTokenRepository,
						  PasswordEncoder passwordEncoder, TokenBlacklistService tokenBlacklistService,
						  EmailService emailService, DoctorProfileRepository doctorProfileRepository,
						  DoctorExperienceRepository doctorExperienceRepository, ApprovalRequestRepository approvalRequestRepository) {
		this.authenticationManager = authenticationManager;
		this.jwtUtil = jwtUtil;
		this.userAccountRepository = userAccountRepository;
		this.otpTokenRepository = otpTokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.tokenBlacklistService = tokenBlacklistService;
		this.emailService = emailService;
		this.doctorProfileRepository = doctorProfileRepository;
		this.doctorExperienceRepository = doctorExperienceRepository;
		this.approvalRequestRepository = approvalRequestRepository;
	}

	@Override
	public Map<String, Object> login(String email, String password) {
		// First check if user exists
		UserAccount userAccount = userAccountRepository.findByEmailAndIsDeletedFalse(email).orElse(null);
		if (userAccount == null) {
			throw new BadRequestException("Tài khoản không tồn tại.");
		}

		// Check account status before authentication
		if (userAccount.getStatus() == AccountStatus.PENDING) {
			throw new BadRequestException("Tài khoản đang chờ phê duyệt.");
		}
		if (userAccount.getStatus() != AccountStatus.ACTIVE) {
			throw new BadRequestException("Tài khoản đang bị vô hiệu hóa.");
		}

		try {
		// Authenticate với email
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(email, password));
		SecurityContextHolder.getContext().setAuthentication(authentication);
		} catch (org.springframework.security.authentication.BadCredentialsException e) {
			// Password is wrong
			throw new BadRequestException("Sai mật khẩu.");
		} catch (Exception e) {
			log.error("Authentication error: {}", e.getMessage());
			throw new BadRequestException("Không thể tạo phiên làm việc. Vui lòng thử lại.");
		}

		try {
			// Get user account again after successful authentication
			userAccount = userAccountRepository.findByEmailAndIsDeletedFalse(email)
					.orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại."));

		String accessToken = jwtUtil.generateToken(userAccount);
		String refreshToken = jwtUtil.generateRefreshToken(userAccount);

		// Build user info
		Map<String, Object> userInfo = new HashMap<>();
		userInfo.put("id", userAccount.getId().toString());
		userInfo.put("email", userAccount.getEmail());
		userInfo.put("fullName", userAccount.getFullName());
		userInfo.put("role", userAccount.getRole().name());
		userInfo.put("accountStatus", userAccount.getStatus().name());
			userInfo.put("firstLoginRequired", userAccount.getFirstLoginRequired());

		Map<String, Object> response = new HashMap<>();
		response.put("access_token", accessToken);
		response.put("token_type", "Bearer");
		response.put("expires_in", 86400); // 24 hours
		response.put("refresh_token", refreshToken);
		response.put("user", userInfo);

		return response;
		} catch (Exception e) {
			log.error("Token generation error: {}", e.getMessage());
			throw new BadRequestException("Không thể tạo phiên làm việc. Vui lòng thử lại.");
		}
	}

	@Override
	public Map<String, Object> refreshToken(String refreshToken) {
		String email = jwtUtil.extractEmail(refreshToken);
		UserAccount userAccount = userAccountRepository.findByEmailAndIsDeletedFalse(email)
				.orElseThrow(() -> new BadRequestException("User not found"));

		if (!jwtUtil.isRefreshToken(refreshToken)) {
			throw new BadRequestException("Invalid refresh token");
		}

		if (!jwtUtil.isTokenValid(refreshToken, userAccount)) {
			throw new BadRequestException("Invalid refresh token");
		}

		String newAccessToken = jwtUtil.generateToken(userAccount);

		Map<String, Object> response = new HashMap<>();
		response.put("access_token", newAccessToken);
		response.put("token_type", "Bearer");
		response.put("expires_in", 86400);

		return response;
	}

	@Override
	public void logout(String refreshToken) {
		try {
			String email = jwtUtil.extractEmail(refreshToken);
			tokenBlacklistService.blacklist(refreshToken);
		} catch (Exception e) {
			log.error("Error during logout: {}", e.getMessage());
			throw new BadRequestException("Invalid token");
		}
	}

	@Override
	@Caching(evict = {
			@CacheEvict(value = "userDetails", key = "#email"),
			@CacheEvict(value = "users", allEntries = true)
	})
	public void changePassword(String email, ChangePasswordRequest request) {
		UserAccount userAccount = userAccountRepository.findByEmailAndIsDeletedFalse(email)
				.orElseThrow(() -> new BadRequestException("User not found"));

		if (!passwordEncoder.matches(request.getOldPassword(), userAccount.getPasswordHash())) {
			throw new BadRequestException("Current password is incorrect");
		}

		userAccount.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
		userAccountRepository.save(userAccount);
	}

	@Override
	@Caching(evict = {
			@CacheEvict(value = "userDetails", key = "#email"),
			@CacheEvict(value = "users", allEntries = true)
	})
	public void changePasswordOnFirstLogin(String email, FirstLoginPasswordChangeRequest request) {
		UserAccount userAccount = userAccountRepository.findByEmailAndIsDeletedFalse(email)
				.orElseThrow(() -> new BadRequestException("User not found"));

		// Check if this is actually a first login
		if (!userAccount.getFirstLoginRequired()) {
			throw new BadRequestException("First login password change is not required for this account");
		}

		// Validate that new password and confirm password match
		if (!request.getNewPassword().equals(request.getConfirmPassword())) {
			throw new BadRequestException("New password and confirm password do not match");
		}

		// Update password
		userAccount.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
		// Set first_login_required to false after successful password change
		userAccount.setFirstLoginRequired(false);
		userAccountRepository.save(userAccount);
	}

	@Override
	public void forgetPassword(String email) {
		UserAccount userAccount = userAccountRepository.findByEmailAndIsDeletedFalse(email)
				.orElseThrow(() -> new BadRequestException("User not found"));

		// Generate OTP
		String otp = generateOtp();
		
		// Save OTP to database with 15 minutes expiration
		OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(15);
		OtpToken otpToken = OtpToken.builder()
				.userId(userAccount.getId())
				.code(otp)
				.purpose(com.example.HealthCare.enums.OtpPurpose.PASSWORD_RESET)
				.expiresAt(expiresAt)
				.attemptCount(0)
				.maxAttempts(5)
				.build();
		otpTokenRepository.save(otpToken);

		// Send OTP via email
		emailService.sendOtpEmail(userAccount.getEmail(), otp);
	}

	@Override
	@CacheEvict(value = "userDetails", key = "#email")
	public void resetPassword(String email, String otp, String newPassword) {
		UserAccount userAccount = userAccountRepository.findByEmailAndIsDeletedFalse(email)
				.orElseThrow(() -> new BadRequestException("User not found"));

		// Validate OTP
		OtpToken otpToken = otpTokenRepository.findValidOtp(
				userAccount.getId(),
				otp,
				com.example.HealthCare.enums.OtpPurpose.PASSWORD_RESET,
				OffsetDateTime.now()
		).orElseThrow(() -> {
			// Increment attempt count if OTP exists but invalid
			otpTokenRepository.findFirstByUserIdAndPurposeOrderByCreatedAtDesc(
					userAccount.getId(),
					com.example.HealthCare.enums.OtpPurpose.PASSWORD_RESET
			).ifPresent(token -> {
				if (token.getConsumedAt() == null && token.getExpiresAt().isAfter(OffsetDateTime.now())) {
					token.setAttemptCount(token.getAttemptCount() + 1);
					otpTokenRepository.save(token);
					
					if (token.getAttemptCount() >= token.getMaxAttempts()) {
						throw new BadRequestException("Maximum OTP attempts exceeded. Please request a new OTP.");
					}
				}
			});
			
			return new BadRequestException("Invalid or expired OTP code");
		});

		// Mark OTP as consumed
		otpToken.setConsumedAt(OffsetDateTime.now());
		otpTokenRepository.save(otpToken);

		// Update password
		userAccount.setPasswordHash(passwordEncoder.encode(newPassword));
		userAccountRepository.save(userAccount);
	}

	@Override
	public Map<String, Object> register(RegisterRequest request) {
		// Check if email already exists
		if (userAccountRepository.existsByEmail(request.getEmail())) {
			throw new UsernameIsExistException("Email already exists");
		}

		// Check if phone already exists
		if (userAccountRepository.existsByPhoneNumber(request.getPhoneNumber())) {
			throw new BadRequestException("Phone number already exists");
		}

		// Determine role from request
		UserRole role = determineRole(request.getRole());

		// Determine account status based on role
		// Patients are immediately active, doctors need approval
		AccountStatus accountStatus;
		Boolean firstLoginRequired;
		if (role == UserRole.PATIENT) {
			accountStatus = AccountStatus.ACTIVE;
			firstLoginRequired = false;
		} else {
			accountStatus = AccountStatus.PENDING;
			firstLoginRequired = true;
		}

		// Create UserAccount
		UserAccount userAccount = UserAccount.builder()
				.email(request.getEmail())
				.phoneNumber(request.getPhoneNumber())
				.passwordHash(passwordEncoder.encode(request.getPassword()))
				.fullName(request.getFullName())
				.gender(request.getGender())
				.dateOfBirth(request.getDateOfBirth())
				.role(role)
				.status(accountStatus)
				.firstLoginRequired(firstLoginRequired)
				.build();

		userAccount = userAccountRepository.save(userAccount);

		// Generate tokens
		String accessToken = jwtUtil.generateToken(userAccount);
		String refreshToken = jwtUtil.generateRefreshToken(userAccount);

		Map<String, Object> response = new HashMap<>();
		response.put("user_id", userAccount.getId());
		response.put("email", userAccount.getEmail());
		response.put("access_token", accessToken);
		response.put("refresh_token", refreshToken);
		return response;
	}

	@Override
	public PersonalInfoResponse registerPersonalInfo(PersonalInfoRequest request) {
		// Check if email already exists
		if (userAccountRepository.existsByEmail(request.getEmail())) {
			throw new UsernameIsExistException("Email already exists");
		}

		// Check if phone already exists
		if (userAccountRepository.existsByPhoneNumber(request.getPhone())) {
			throw new BadRequestException("Phone number already exists");
		}

		// Create UserAccount for doctor with PENDING status
		UserAccount userAccount = UserAccount.builder()
				.email(request.getEmail())
				.phoneNumber(request.getPhone())
				.fullName(request.getFullName())
				.gender(request.getGender())
				.dateOfBirth(request.getDateOfBirth())
				.role(UserRole.DOCTOR)
				.status(AccountStatus.PENDING) // Will be ACTIVE after admin approval
				.firstLoginRequired(true) // Set to true for doctors to set password on first login
				.build();

		userAccount = userAccountRepository.save(userAccount);

		// Create response
		PersonalInfoResponse response = new PersonalInfoResponse();
		response.setUserId(userAccount.getId());
		response.setEmail(userAccount.getEmail());
		response.setFullName(userAccount.getFullName());
		response.setPhone(userAccount.getPhoneNumber());
		response.setIdentityCard(request.getIdentityCard());
		response.setDateOfBirth(userAccount.getDateOfBirth());
		response.setGender(userAccount.getGender());
		response.setAddress(request.getAddress());
		response.setCountry(request.getCountry());
		response.setState(request.getState());
		response.setCity(request.getCity());
		response.setZipCode(request.getZipCode());
		response.setAddressLine1(request.getAddressLine1());
		response.setAddressLine2(request.getAddressLine2());
		response.setHasExistingAccount(false);
		return response;
	}

	// Helper method to format array to PostgreSQL array string format
	private String formatArrayString(java.util.List<String> list) {
		if (list == null || list.isEmpty()) {
			return "{}";
		}
		StringBuilder sb = new StringBuilder();
		sb.append("{");
		for (int i = 0; i < list.size(); i++) {
			if (i > 0) {
				sb.append(",");
			}
			sb.append("\"").append(list.get(i).replace("\"", "\\\"")).append("\"");
		}
		sb.append("}");
		return sb.toString();
	}

	@Override
	public void registerProfessionalInfo(ProfessionalInfoRequest request) {
		// Find the user account
		UserAccount userAccount = userAccountRepository.findById(request.getUserId())
				.orElseThrow(() -> new BadRequestException("User not found"));

		// Verify it's a doctor account
		if (userAccount.getRole() != UserRole.DOCTOR) {
			throw new BadRequestException("User is not a doctor");
		}

		// Check if practice license number already exists
		if (doctorProfileRepository.existsByPracticeLicenseNo(request.getPracticingCertificationId())) {
			throw new BadRequestException("Practice license number already exists");
		}

		// Update password if provided
		if (request.getPassword() != null && !request.getPassword().isBlank()) {
			userAccount.setPasswordHash(passwordEncoder.encode(request.getPassword()));
			userAccountRepository.save(userAccount);
		}

		// Build care target from checkboxes in PostgreSQL array format
		java.util.List<String> careTargetList = new java.util.ArrayList<>();
		if (request.isCareForAdults()) {
			careTargetList.add("Người lớn");
		}
		if (request.isCareForChildren()) {
			careTargetList.add("Trẻ em");
		}
		String careTarget = careTargetList.isEmpty() ? "{\"Người lớn\"}" : formatArrayString(careTargetList);

		// Create DoctorProfile with proper defaults for required fields
		DoctorProfile doctorProfile = DoctorProfile.builder()
				.userId(request.getUserId())
				.practiceLicenseNo(request.getPracticingCertificationId())
				.cccdNumber(request.getCccdNumber() != null && !request.getCccdNumber().isBlank() 
						? request.getCccdNumber() 
						: "N/A")
				.title(request.getTitle() != null && !request.getTitle().isBlank() 
						? request.getTitle() 
						: "Doctor")
				.workplaceName(request.getClinicHospital() != null && !request.getClinicHospital().isBlank() 
						? request.getClinicHospital() 
						: "N/A")
				.facilityName(request.getClinicHospital() != null && !request.getClinicHospital().isBlank() 
						? request.getClinicHospital() 
						: "N/A")
				.clinicAddress(request.getCurrentProvince() != null 
						? request.getCurrentProvince() 
						: "N/A")
				.careTarget(careTarget != null && !careTarget.isBlank() ? careTarget : "{\"Người lớn\"}")
				.specialties(request.getSpecialties() != null && !request.getSpecialties().isEmpty() 
						? formatArrayString(request.getSpecialties()) 
						: "{\"Tổng quát\"}")
				.diseasesTreated(request.getTreatmentConditions() != null && !request.getTreatmentConditions().isEmpty() 
						? formatArrayString(request.getTreatmentConditions()) 
						: "{\"Tổng quát\"}")
				.educationSummary(request.getSpecialty() != null && !request.getSpecialty().isBlank() 
						? request.getSpecialty() 
						: "Medical Degree")
				.trainingInstitution(request.getEducationalInstitution() != null && !request.getEducationalInstitution().isBlank() 
						? request.getEducationalInstitution() 
						: "N/A")
				.graduationYear(request.getGraduationYear() != null && request.getGraduationYear() > 1900 
						? request.getGraduationYear() 
						: 2020)
				.major(request.getSpecialty() != null && !request.getSpecialty().isBlank() 
						? request.getSpecialty() 
						: "Medicine")
				.address("N/A")
				.province(request.getCurrentProvince() != null 
						? request.getCurrentProvince() 
						: "N/A")
				.build();

		doctorProfileRepository.save(doctorProfile);

		// Create work experience if provided
		if (request.getWorkFromYear() != null && request.getWorkToYear() != null 
				&& request.getWorkClinicHospital() != null && !request.getWorkClinicHospital().isBlank()) {
			Integer workFromYear = request.getWorkFromYear();
			Integer workToYear = request.getWorkToYear();
			DoctorExperience experience = DoctorExperience.builder()
					.doctorId(request.getUserId())
					.fromDate(java.time.LocalDate.of(workFromYear, 1, 1))
					.toDate(java.time.LocalDate.of(workToYear, 12, 31))
					.organization(request.getWorkClinicHospital())
					.location(request.getWorkLocation() != null ? request.getWorkLocation() : "")
					.specialty(request.getWorkSpecialties() != null && !request.getWorkSpecialties().isEmpty() 
							? formatArrayString(request.getWorkSpecialties()) 
							: "{\"Tổng quát\"}")
					.build();
			doctorExperienceRepository.save(experience);
		}

		// Create ApprovalRequest for admin to review
		ApprovalRequest approvalRequest = ApprovalRequest.builder()
				.userId(request.getUserId())
				.type("doctor_onboarding")
				.status(RequestStatus.PENDING)
				.submittedAt(OffsetDateTime.now())
				.build();
		approvalRequestRepository.save(approvalRequest);
	}

	@Override
	@Caching(evict = {
		@CacheEvict(value = "pendingDoctors", allEntries = true),
		@CacheEvict(value = "users", allEntries = true)
	})
	public void approveDoctorAccount(UUID userId) {
		UserAccount userAccount = userAccountRepository.findById(userId)
				.orElseThrow(() -> new BadRequestException("User not found"));

		if (userAccount.getRole() != UserRole.DOCTOR) {
			throw new BadRequestException("User is not a doctor");
		}

		UserAccount currentAdmin = getCurrentUser();
		String randomPassword = generateRandomPassword();

		approvalRequestRepository.findByUserId(userId).ifPresent(approvalRequest -> {
			approvalRequest.setStatus(RequestStatus.APPROVED);
			approvalRequest.setReviewedAt(OffsetDateTime.now());
			if (currentAdmin != null) {
				approvalRequest.setReviewedBy(currentAdmin.getId());
			}
			approvalRequestRepository.save(approvalRequest);
		});

		userAccount.setStatus(AccountStatus.ACTIVE);
		userAccount.setPasswordHash(passwordEncoder.encode(randomPassword));
		userAccount.setFirstLoginRequired(true);
		if (currentAdmin != null) {
			userAccount.setUpdatedBy(currentAdmin);
		}
		userAccountRepository.save(userAccount);
		emailService.sendApprovalEmail(userAccount.getEmail(), userAccount.getFullName(), randomPassword);
	}

	@Override
	@CacheEvict(value = "pendingDoctors", allEntries = true)
	public void rejectDoctorAccount(UUID userId, String reason) {
		UserAccount userAccount = userAccountRepository.findById(userId)
				.orElseThrow(() -> new BadRequestException("User not found"));

		if (userAccount.getRole() != UserRole.DOCTOR) {
			throw new BadRequestException("User is not a doctor");
		}

		userAccount.setStatus(AccountStatus.INACTIVE);
		userAccountRepository.save(userAccount);
		emailService.sendRejectionEmail(userAccount.getEmail(), reason);
	}

	private UserAccount getCurrentUser() {
		try {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			if (authentication == null) {
				return null;
			}
			
			Object principal = authentication.getPrincipal();
			
			String email = null;
			
			if (principal instanceof UserDetails) {
				email = ((UserDetails) principal).getUsername();
			} else if (principal instanceof String) {
				email = (String) principal;
			}
			
			if (email == null || email.isBlank()) {
				return null;
			}
			
			UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email).orElse(null);
			return user;
		} catch (Exception e) {
			log.error("Error getting current user: {}", e.getMessage());
			return null;
		}
	}

	private String generateOtp() {
		Random random = new Random();
		int otp = 100000 + random.nextInt(900000);
		return String.valueOf(otp);
	}

	private String generateRandomPassword() {
		String upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		String lowerCase = "abcdefghijklmnopqrstuvwxyz";
		String numbers = "0123456789";
		String allChars = upperCase + lowerCase + numbers;
		
		Random random = new Random();
		StringBuilder password = new StringBuilder();
		
		password.append(upperCase.charAt(random.nextInt(upperCase.length())));
		password.append(lowerCase.charAt(random.nextInt(lowerCase.length())));
		password.append(numbers.charAt(random.nextInt(numbers.length())));
		
		for (int i = 3; i < 8; i++) {
			password.append(allChars.charAt(random.nextInt(allChars.length())));
		}
		
		char[] chars = password.toString().toCharArray();
		for (int i = chars.length - 1; i > 0; i--) {
			int j = random.nextInt(i + 1);
			char temp = chars[i];
			chars[i] = chars[j];
			chars[j] = temp;
		}
		
		return new String(chars);
	}

	private UserRole determineRole(String roleString) {
		if (roleString == null) {
			return UserRole.PATIENT;
		}
		try {
			return UserRole.valueOf(roleString.toUpperCase());
		} catch (IllegalArgumentException e) {
			return UserRole.PATIENT;
		}
	}
}

