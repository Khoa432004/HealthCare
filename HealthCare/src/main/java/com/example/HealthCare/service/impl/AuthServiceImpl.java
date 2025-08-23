package com.example.HealthCare.service.impl;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
import com.example.HealthCare.enums.RoleType;
import com.example.HealthCare.exception.BadRequestException;
import com.example.HealthCare.exception.UsernameIsExistException;
import com.example.HealthCare.model.Account;
import com.example.HealthCare.model.Role;
import com.example.HealthCare.model.User;
import com.example.HealthCare.repository.AccountRepository;
import com.example.HealthCare.repository.RoleRepository;
import com.example.HealthCare.repository.UserRepository;
import com.example.HealthCare.security.JwtUtil;
import com.example.HealthCare.security.TokenBlacklistService;
import com.example.HealthCare.service.AuthService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;
	private final AccountRepository accountRepository;
	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PasswordEncoder passwordEncoder;
	private final JavaMailSender mailSender;
	private final TokenBlacklistService tokenBlacklistService;

	public AuthServiceImpl(AuthenticationManager authenticationManager, JwtUtil jwtUtil, 
						  AccountRepository accountRepository, UserRepository userRepository,
						  RoleRepository roleRepository, PasswordEncoder passwordEncoder, 
						  JavaMailSender mailSender, TokenBlacklistService tokenBlacklistService) {
		this.authenticationManager = authenticationManager;
		this.jwtUtil = jwtUtil;
		this.accountRepository = accountRepository;
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.passwordEncoder = passwordEncoder;
		this.mailSender = mailSender;
		this.tokenBlacklistService = tokenBlacklistService;
	}

	@Override
	public Map<String, Object> login(String username, String password) {
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(username, password));
		SecurityContextHolder.getContext().setAuthentication(authentication);
		
		Account account = accountRepository.findByUsername(username)
				.orElseThrow(() -> new BadRequestException("Account not found"));
		
		String accessToken = jwtUtil.generateToken(account);
		String refreshToken = jwtUtil.generateRefreshToken(account);
		
		Map<String, Object> response = new HashMap<>();
		response.put("access_token", accessToken);
		response.put("token_type", "Bearer");
		response.put("expires_in", 86400); // 24 hours
		response.put("refresh_token", refreshToken);
		
		return response;
	}

	@Override
	public Map<String, Object> refreshToken(String refreshToken) {
		// Validate refresh token and issue a new access token
		String username = jwtUtil.extractUsername(refreshToken);
		Account account = accountRepository.findByUsername(username)
				.orElseThrow(() -> new BadRequestException("Account not found"));
		
		if (!jwtUtil.isRefreshToken(refreshToken)) {
			throw new BadRequestException("Invalid refresh token");
		}
		
		String newAccessToken = jwtUtil.generateToken(account);
		Map<String, Object> response = new HashMap<>();
		response.put("access_token", newAccessToken);
		response.put("token_type", "Bearer");
		response.put("expires_in", 86400);
		return response;
	}

	@Override
	@CacheEvict(value = "privileges", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
	public void changePassword(ChangePasswordRequest req) {
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		Account account = accountRepository.findByUsername(username)
				.orElseThrow(() -> new BadRequestException("Account not found"));
		
		if (!passwordEncoder.matches(req.getOldPassword(), account.getPassword())) {
			throw new BadRequestException("Old password is incorrect");
		}
		
		account.setPassword(passwordEncoder.encode(req.getNewPassword()));
		accountRepository.save(account);
	}

	@Override
	public void logout(String accessToken, String refreshToken) {
		log.info("Starting logout process");
		log.debug("Access token provided: {}", accessToken != null);
		log.debug("Refresh token provided: {}", refreshToken != null);
		
		if (accessToken != null && accessToken.startsWith("Bearer ")) {
			accessToken = accessToken.substring(7);
			log.debug("Extracted access token from Bearer header");
		}

		// Only blacklist tokens if they are not null
		if (accessToken != null && !accessToken.trim().isEmpty()) {
			tokenBlacklistService.blacklist(accessToken);
			log.info("Access token blacklisted successfully");
		} else {
			log.warn("No valid access token provided for blacklisting");
		}
		
		if (refreshToken != null && !refreshToken.trim().isEmpty()) {
			tokenBlacklistService.blacklist(refreshToken);
			log.info("Refresh token blacklisted successfully");
		} else {
			log.warn("No valid refresh token provided for blacklisting");
		}
		
		log.info("User logged out successfully");
	}

	@Override
	public void sendResetPasswordEmail(String username) {
		log.info("Starting password reset process for username: {}", username);
		
		Account account = accountRepository.findByUsername(username)
				.orElseThrow(() -> {
					log.error("Account not found for username: {}", username);
					return new BadRequestException("Account not found");
				});
		
		log.info("Found account for username: {}, email: {}", username, account.getEmail());
		
		String otp = String.format("%06d", new Random().nextInt(1_000_000));
		account.setResetOtp(otp);
		account.setResetOtpExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
		accountRepository.save(account);
		
		log.info("Generated OTP for username: {}, OTP: {}", username, otp);

		SimpleMailMessage message = new SimpleMailMessage();
		message.setTo(account.getEmail());
		message.setSubject("HealthCare - Password Reset OTP");
		message.setText(String.format(
			"""
			Hello %s,

			You have requested to reset your password for your HealthCare account.

			Your OTP (One-Time Password) is: %s

			This code will expire in 10 minutes.

			If you did not request this password reset, please ignore this email.

			Best regards,
			HealthCare Team""",
			account.getUsername(), otp
		));
		try {
			mailSender.send(message);
			log.info("Sent OTP to {}", account.getEmail());
		} catch (Exception e) {
			log.error("Failed to send email to {}: {}", account.getEmail(), e.getMessage());
			throw new RuntimeException("Failed to send reset password email", e);
		}
		
		log.info("Password reset process completed successfully for username: {}", username);
	}

	@Override
	public void resetPasswordWithOtp(String username, String otp, String newPassword) {
		Account account = accountRepository.findByUsername(username)
				.orElseThrow(() -> new BadRequestException("Account not found"));
		if (account.getResetOtp() == null
				|| account.getResetOtpExpiresAt() == null
				|| Instant.now().isAfter(account.getResetOtpExpiresAt())
				|| !otp.equals(account.getResetOtp())) {
			throw new BadRequestException("Invalid or expired OTP");
		}
		account.setPassword(passwordEncoder.encode(newPassword));
		account.setResetOtp(null);
		account.setResetOtpExpiresAt(null);
		accountRepository.save(account);
	}

	@Override
	@CacheEvict(value = {"users", "userDetails", "pendingDoctors"}, allEntries = true)
	public Map<String, Object> register(RegisterRequest registerRequest) {
		log.info("Starting registration process for username: {}", registerRequest.getUsername());
		
		// Check if username already exists
		if (accountRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
			throw new UsernameIsExistException("Username already exists");
		}
		
		// Check if email already exists
		if (accountRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
			throw new BadRequestException("Email already exists");
		}
		
		// Check if phone already exists
		if (userRepository.findByPhone(registerRequest.getPhone()).isPresent()) {
			throw new BadRequestException("Phone number already exists");
		}
		
		// Check if identity card already exists
		if (userRepository.findByIdentityCard(registerRequest.getIdentityCard()).isPresent()) {
			throw new BadRequestException("Identity card already exists");
		}

		// Get default role (PATIENT role for new registrations)
		Role defaultRole = roleRepository.findByName(RoleType.PATIENT)
			.orElseThrow(() -> new BadRequestException("Default role not found"));
		
		// Create account
		Account account = new Account();
		account.setUsername(registerRequest.getUsername());
		account.setEmail(registerRequest.getEmail());
		account.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
		account.setRole(defaultRole);
		account.setIsDeleted(false);
		
		Account savedAccount = accountRepository.save(account);
		log.info("Account created successfully for username: {}", registerRequest.getUsername());
		
		// Create user
		User user = User.builder()
			.fullName(registerRequest.getFullName())
			.phone(registerRequest.getPhone())
			.identityCard(registerRequest.getIdentityCard())
			.dateOfBirth(registerRequest.getDateOfBirth())
			.gender(registerRequest.getGender())
			.address(registerRequest.getAddress())
			.department(registerRequest.getDepartment())
			.isDeleted(false)
			.isLocked(false)
			.account(savedAccount)
			.build();
		
		User savedUser = userRepository.save(user);
		log.info("User created successfully for username: {}", registerRequest.getUsername());
		
		// Generate tokens for auto-login after registration
		String accessToken = jwtUtil.generateToken(savedAccount);
		String refreshToken = jwtUtil.generateRefreshToken(savedAccount);
		
		Map<String, Object> response = new HashMap<>();
		response.put("access_token", accessToken);
		response.put("token_type", "Bearer");
		response.put("expires_in", 86400); // 24 hours
		response.put("refresh_token", refreshToken);
		response.put("user_id", savedUser.getId());
		response.put("username", savedAccount.getUsername());
		response.put("email", savedAccount.getEmail());
		
		log.info("Registration completed successfully for username: {}", registerRequest.getUsername());
		return response;
	}

	@Override
	@CacheEvict(value = {"users", "userDetails"}, allEntries = true)
	public PersonalInfoResponse registerPersonalInfo(PersonalInfoRequest request) {
		log.info("Starting personal info registration for identity card: {}", request.getIdentityCard());
		
		// Check if identity card already exists - REJECT if exists
		Optional<User> existingUser = userRepository.findByIdentityCard(request.getIdentityCard());
		
		if (existingUser.isPresent()) {
			log.warn("Identity card already exists: {}", request.getIdentityCard());
			throw new BadRequestException("Identity card already exists in the system. Cannot create duplicate user.");
		}
		
		// Check if phone already exists with different identity card
		if (userRepository.findByPhone(request.getPhone()).isPresent()) {
			throw new BadRequestException("Phone number already exists with different identity card");
		}
		
		// Create new user
		User newUser = User.builder()
			.fullName(request.getFullName())
			.phone(request.getPhone())
			.identityCard(request.getIdentityCard())
			.dateOfBirth(request.getDateOfBirth())
			.gender(request.getGender())
			.address(buildFullAddress(request))
			.country(request.getCountry())
			.state(request.getState())
			.city(request.getCity())
			.zipCode(request.getZipCode())
			.addressLine1(request.getAddressLine1())
			.addressLine2(request.getAddressLine2())
			.department("") // Will be set in professional info step
			.isDeleted(false)
			.isLocked(false)
			.build();
		
		User savedUser = userRepository.save(newUser);
		log.info("Created new user for identity card: {}", request.getIdentityCard());
		
		PersonalInfoResponse response = new PersonalInfoResponse();
		response.setUserId(savedUser.getId());
		response.setFullName(savedUser.getFullName());
		response.setPhone(savedUser.getPhone());
		response.setIdentityCard(savedUser.getIdentityCard());
		response.setDateOfBirth(savedUser.getDateOfBirth());
		response.setGender(savedUser.getGender());
		response.setAddress(savedUser.getAddress());
		response.setCountry(savedUser.getCountry());
		response.setState(savedUser.getState());
		response.setCity(savedUser.getCity());
		response.setZipCode(savedUser.getZipCode());
		response.setAddressLine1(savedUser.getAddressLine1());
		response.setAddressLine2(savedUser.getAddressLine2());
		response.setHasExistingAccount(false);
		
		return response;
	}

	@Override
	@Cacheable(value = "userDetails", key = "'identity:' + #identityCard")
	public PersonalInfoResponse getPersonalInfoByIdentityCard(String identityCard) {
		log.info("Fetching personal info for identity card: {}", identityCard);
		
		Optional<User> userOpt = userRepository.findByIdentityCard(identityCard);
		
		if (userOpt.isPresent()) {
			User user = userOpt.get();
			boolean hasAccount = user.getAccount() != null;
			
			PersonalInfoResponse response = new PersonalInfoResponse();
			response.setUserId(user.getId());
			response.setFullName(user.getFullName());
			response.setPhone(user.getPhone());
			response.setIdentityCard(user.getIdentityCard());
			response.setDateOfBirth(user.getDateOfBirth());
			response.setGender(user.getGender());
			response.setAddress(user.getAddress());
			response.setCountry(user.getCountry());
			response.setState(user.getState());
			response.setCity(user.getCity());
			response.setZipCode(user.getZipCode());
			response.setAddressLine1(user.getAddressLine1());
			response.setAddressLine2(user.getAddressLine2());
			response.setHasExistingAccount(hasAccount);
			
			return response;
		} else {
			throw new BadRequestException("No user found with this identity card");
		}
	}

	@Override
	@Caching(evict = {
		@CacheEvict(value = "users", allEntries = true),
		@CacheEvict(value = "userDetails", allEntries = true),
		@CacheEvict(value = "pendingDoctors", allEntries = true)
	})
	public Map<String, Object> registerProfessionalInfo(ProfessionalInfoRequest request) {
		log.info("Starting professional info registration for user ID: {}", request.getUserId());
		
		// Get the user
		User user = userRepository.findById(request.getUserId())
			.orElseThrow(() -> new BadRequestException("User not found"));
		
		// Check if user already has an account
		if (user.getAccount() != null) {
			throw new BadRequestException("User already has an account");
		}
		
		// Check if username already exists
		if (accountRepository.findByUsername(request.getUsername()).isPresent()) {
			throw new UsernameIsExistException("Username already exists");
		}
		
		// Check if email already exists
		if (accountRepository.findByEmail(request.getEmail()).isPresent()) {
			throw new BadRequestException("Email already exists");
		}

		// Get DOCTOR role
		Role doctorRole = roleRepository.findByName(RoleType.DOCTOR)
			.orElseThrow(() -> new BadRequestException("Doctor role not found"));
		
		// Create account
		Account account = new Account();
		account.setUsername(request.getUsername());
		account.setEmail(request.getEmail());
		account.setPassword(passwordEncoder.encode(request.getPassword()));
		account.setRole(doctorRole);
		account.setIsDeleted(false);
		
		// Set professional information
		account.setTitle(request.getTitle());
		account.setCurrentProvince(request.getCurrentProvince());
		account.setClinicHospital(request.getClinicHospital());
		account.setCareForAdults(request.isCareForAdults());
		account.setCareForChildren(request.isCareForChildren());
		account.setSpecialties(request.getSpecialties());
		account.setTreatmentConditions(request.getTreatmentConditions());
		account.setPracticingCertificationId(request.getPracticingCertificationId());
		account.setLanguages(request.getLanguages());
		account.setWorkFromYear(request.getWorkFromYear());
		account.setWorkToYear(request.getWorkToYear());
		account.setWorkClinicHospital(request.getWorkClinicHospital());
		account.setWorkLocation(request.getWorkLocation());
		account.setWorkSpecialties(request.getWorkSpecialties());
		account.setEducationalInstitution(request.getEducationalInstitution());
		account.setGraduationYear(request.getGraduationYear());
		account.setSpecialtyEducation(request.getSpecialty());
		
		Account savedAccount = accountRepository.save(account);
		log.info("Account created successfully for username: {}", request.getUsername());
		
		// Update user with account and department
		user.setAccount(savedAccount);
		user.setDepartment(request.getDepartment());
		
		// Set user as locked (pending admin approval for doctor accounts)
		user.setLocked(true);
		log.info("Doctor account set to locked status (pending admin approval) for user ID: {}", request.getUserId());
		
		User savedUser = userRepository.save(user);
		log.info("User updated with account and department for user ID: {}", request.getUserId());
		
		Map<String, Object> response = new HashMap<>();
		response.put("user_id", savedUser.getId());
		response.put("account_id", savedAccount.getId());
		response.put("username", savedAccount.getUsername());
		response.put("email", savedAccount.getEmail());
		response.put("role", doctorRole.getName().toString());
		response.put("status", "PENDING_APPROVAL");
		response.put("message", "Tài khoản bác sĩ đã được tạo thành công. Vui lòng chờ admin duyệt để có thể sử dụng.");
		response.put("practicing_certificate_id", savedAccount.getPracticingCertificationId());
		
		// Note: No tokens generated as account is pending approval
		
		log.info("Professional registration completed successfully for user ID: {}", request.getUserId());
		return response;
	}

	@Override
	@Caching(evict = {
		@CacheEvict(value = "users", allEntries = true),
		@CacheEvict(value = "userDetails", key = "#userId"),
		@CacheEvict(value = "pendingDoctors", allEntries = true)
	})
	public Map<String, Object> approveDoctorAccount(Long userId) {
		log.info("Starting doctor account approval for user ID: {}", userId);
		
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new BadRequestException("User not found"));
		
		if (user.getAccount() == null) {
			throw new BadRequestException("User does not have an account");
		}
		
		if (!user.getAccount().getRole().getName().equals(RoleType.DOCTOR)) {
			throw new BadRequestException("User is not a doctor");
		}
		
		if (!user.isLocked()) {
			throw new BadRequestException("User account is already approved");
		}
		
		// Unlock the user account (approve)
		user.setLocked(false);
		User savedUser = userRepository.save(user);
		
		log.info("Doctor account approved successfully for user ID: {}", userId);
		
		Map<String, Object> response = new HashMap<>();
		response.put("user_id", savedUser.getId());
		response.put("username", savedUser.getAccount().getUsername());
		response.put("email", savedUser.getAccount().getEmail());
		response.put("status", "APPROVED");
		response.put("message", "Tài khoản bác sĩ đã được duyệt thành công.");
		response.put("practicing_certificate_id", savedUser.getAccount().getPracticingCertificationId());
		
		return response;
	}

	@Override
	@Caching(evict = {
		@CacheEvict(value = "users", allEntries = true),
		@CacheEvict(value = "userDetails", key = "#userId"),
		@CacheEvict(value = "pendingDoctors", allEntries = true)
	})
	public Map<String, Object> rejectDoctorAccount(Long userId, String reason) {
		log.info("Starting doctor account rejection for user ID: {}", userId);
		
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new BadRequestException("User not found"));
		
		if (user.getAccount() == null) {
			throw new BadRequestException("User does not have an account");
		}
		
		if (!user.getAccount().getRole().getName().equals(RoleType.DOCTOR)) {
			throw new BadRequestException("User is not a doctor");
		}
		
		if (!user.isLocked()) {
			throw new BadRequestException("User account is already approved");
		}
		
		// Mark account as deleted (rejected)
		user.getAccount().setIsDeleted(true);
		user.setDeleted(true);
		User savedUser = userRepository.save(user);
		
		log.info("Doctor account rejected successfully for user ID: {}", userId);
		
		Map<String, Object> response = new HashMap<>();
		response.put("user_id", savedUser.getId());
		response.put("username", savedUser.getAccount().getUsername());
		response.put("email", savedUser.getAccount().getEmail());
		response.put("status", "REJECTED");
		response.put("message", "Tài khoản bác sĩ đã bị từ chối.");
		response.put("reason", reason);
		
		return response;
	}

	private String buildFullAddress(PersonalInfoRequest request) {
		StringBuilder address = new StringBuilder();
		
		if (request.getAddressLine1() != null && !request.getAddressLine1().trim().isEmpty()) {
			address.append(request.getAddressLine1());
		}
		
		if (request.getAddressLine2() != null && !request.getAddressLine2().trim().isEmpty()) {
			if (address.length() > 0) address.append(", ");
			address.append(request.getAddressLine2());
		}
		
		if (request.getCity() != null && !request.getCity().trim().isEmpty()) {
			if (address.length() > 0) address.append(", ");
			address.append(request.getCity());
		}
		
		if (request.getState() != null && !request.getState().trim().isEmpty()) {
			if (address.length() > 0) address.append(", ");
			address.append(request.getState());
		}
		
		if (request.getCountry() != null && !request.getCountry().trim().isEmpty()) {
			if (address.length() > 0) address.append(", ");
			address.append(request.getCountry());
		}
		
		if (request.getZipCode() != null && !request.getZipCode().trim().isEmpty()) {
			if (address.length() > 0) address.append(" ");
			address.append(request.getZipCode());
		}
		
		// If no detailed address provided, use the general address field
		if (address.length() == 0 && request.getAddress() != null) {
			address.append(request.getAddress());
		}
		
		return address.toString();
	}
}
