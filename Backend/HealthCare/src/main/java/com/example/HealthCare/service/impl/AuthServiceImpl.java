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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.HealthCare.dto.request.ChangePasswordRequest;
import com.example.HealthCare.dto.request.PersonalInfoRequest;
import com.example.HealthCare.dto.request.ProfessionalInfoRequest;
import com.example.HealthCare.dto.request.RegisterRequest;
import com.example.HealthCare.dto.response.PersonalInfoResponse;
import com.example.HealthCare.enums.AccountStatus;
import com.example.HealthCare.enums.UserRole;
import com.example.HealthCare.exception.BadRequestException;
import com.example.HealthCare.exception.UsernameIsExistException;
import com.example.HealthCare.model.OtpToken;
import com.example.HealthCare.model.UserAccount;
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

	public AuthServiceImpl(AuthenticationManager authenticationManager, JwtUtil jwtUtil,
						  UserAccountRepository userAccountRepository, OtpTokenRepository otpTokenRepository,
						  PasswordEncoder passwordEncoder, TokenBlacklistService tokenBlacklistService,
						  EmailService emailService) {
		this.authenticationManager = authenticationManager;
		this.jwtUtil = jwtUtil;
		this.userAccountRepository = userAccountRepository;
		this.otpTokenRepository = otpTokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.tokenBlacklistService = tokenBlacklistService;
		this.emailService = emailService;
	}

	@Override
	public Map<String, Object> login(String email, String password) {
		// Authenticate với email
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(email, password));
		SecurityContextHolder.getContext().setAuthentication(authentication);

		UserAccount userAccount = userAccountRepository.findByEmailAndIsDeletedFalse(email)
				.orElseThrow(() -> new BadRequestException("User not found"));

		// Check account status
		if (userAccount.getStatus() != AccountStatus.ACTIVE) {
			throw new BadRequestException("Account is not active");
		}

		String accessToken = jwtUtil.generateToken(userAccount);
		String refreshToken = jwtUtil.generateRefreshToken(userAccount);

		Map<String, Object> response = new HashMap<>();
		response.put("access_token", accessToken);
		response.put("token_type", "Bearer");
		response.put("expires_in", 86400); // 24 hours
		response.put("refresh_token", refreshToken);

		return response;
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
			log.info("User {} logged out", email);

			// Add token to blacklist
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

		log.info("Password changed for user: {}", email);
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

		log.info("Password reset OTP sent to: {} (valid for 15 minutes)", email);
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
						log.warn("Max OTP attempts reached for user: {}", email);
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

		log.info("Password reset successfully for user: {}", email);
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

		// Create UserAccount
		UserAccount userAccount = UserAccount.builder()
				.email(request.getEmail())
				.phoneNumber(request.getPhoneNumber())
				.passwordHash(passwordEncoder.encode(request.getPassword()))
				.fullName(request.getFullName())
				.gender(request.getGender())
				.dateOfBirth(request.getDateOfBirth())
				.role(role)
				.status(AccountStatus.PENDING) // Pending until verified
				.firstLoginRequired(true)
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

		log.info("User registered: {}", userAccount.getEmail());
		return response;
	}

	@Override
	public PersonalInfoResponse registerPersonalInfo(PersonalInfoRequest request) {
		// Implementation for personal info registration
		// This might create PatientProfile or update UserAccount
		throw new UnsupportedOperationException("Not implemented yet");
	}

	@Override
	public void registerProfessionalInfo(ProfessionalInfoRequest request) {
		// Implementation for professional info (doctor) registration
		// This creates DoctorProfile and ApprovalRequest
		throw new UnsupportedOperationException("Not implemented yet");
	}

	@Override
	@CacheEvict(value = "pendingDoctors", allEntries = true)
	public void approveDoctorAccount(UUID userId) {
		UserAccount userAccount = userAccountRepository.findById(userId)
				.orElseThrow(() -> new BadRequestException("User not found"));

		if (userAccount.getRole() != UserRole.DOCTOR) {
			throw new BadRequestException("User is not a doctor");
		}

		userAccount.setStatus(AccountStatus.ACTIVE);
		userAccountRepository.save(userAccount);

		log.info("Doctor account approved: {}", userAccount.getEmail());
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

		// Send rejection email
		emailService.sendRejectionEmail(userAccount.getEmail(), reason);

		log.info("Doctor account rejected: {}", userAccount.getEmail());
	}

	// Helper methods
	private String generateOtp() {
		Random random = new Random();
		int otp = 100000 + random.nextInt(900000);
		return String.valueOf(otp);
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

