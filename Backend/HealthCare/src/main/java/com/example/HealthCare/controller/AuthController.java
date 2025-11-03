package com.example.HealthCare.controller;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.ChangePasswordRequest;
import com.example.HealthCare.dto.request.FirstLoginPasswordChangeRequest;
import com.example.HealthCare.dto.request.ForgetPasswordRequest;
import com.example.HealthCare.dto.request.LoginRequest;
import com.example.HealthCare.dto.request.PersonalInfoRequest;
import com.example.HealthCare.dto.request.ProfessionalInfoRequest;
import com.example.HealthCare.dto.request.RefreshTokenRequest;
import com.example.HealthCare.dto.request.RegisterRequest;
import com.example.HealthCare.dto.request.ResetPasswordRequest;
import com.example.HealthCare.dto.response.PersonalInfoResponse;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

	private final AuthService authService;

	@ExceptionHandler(HttpMediaTypeNotSupportedException.class)
	public ResponseEntity<Map<String, String>> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex) {
		return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
				.body(Map.of(
					"error", "unsupported_media_type",
					"message", "Content-Type must be application/json"
				));
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
		try {
			Map<String, Object> tokenResponse = authService.login(req.getEmail(), req.getPassword());
			return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Login successfully!", tokenResponse));
		} catch (com.example.HealthCare.exception.BadRequestException ex) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
				"error", "unauthorized",
				"message", ex.getMessage()
			));
		} catch (Exception ex) {
			log.error("Unexpected error during login for user {}: {}", req.getEmail(), ex.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
				"error", "internal_server_error",
				"message", "Đăng nhập không thành công. Vui lòng thử lại sau."
			));
		}
	}

	@PostMapping("/register")
	@Async("controllerTaskExecutor")
	public CompletableFuture<ResponseEntity<?>> register(@Valid @RequestBody RegisterRequest req) {
		return CompletableFuture.supplyAsync(() -> {
			try {
				Map<String, Object> response = authService.register(req);
				return ResponseEntity.status(HttpStatus.CREATED)
					.body(new ResponseSuccess(HttpStatus.CREATED, "Registration successful!", response));
			} catch (Exception ex) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
					"error", "registration_failed",
					"message", ex.getMessage()
				));
			}
		});
	}

	// 2-Step Registration Endpoints

	@PostMapping("/register/personal-info")
	@Async("controllerTaskExecutor")
	public CompletableFuture<ResponseEntity<?>> registerPersonalInfo(@Valid @RequestBody PersonalInfoRequest req) {
		return CompletableFuture.supplyAsync(() -> {
			try {
				PersonalInfoResponse response = authService.registerPersonalInfo(req);
				return ResponseEntity.status(HttpStatus.CREATED)
					.body(new ResponseSuccess(HttpStatus.CREATED, "Personal information saved successfully!", response));
			} catch (Exception ex) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
					"error", "personal_info_registration_failed",
					"message", ex.getMessage()
				));
			}
		});
	}

	// Removed getPersonalInfoByIdentityCard - not needed in new UserAccount flow
	
	@PostMapping("/register/professional-info")
	@Async("controllerTaskExecutor")
	public CompletableFuture<ResponseEntity<?>> registerProfessionalInfo(@Valid @RequestBody ProfessionalInfoRequest req) {
		return CompletableFuture.supplyAsync(() -> {
			try {
				authService.registerProfessionalInfo(req); // Changed to void return
				return ResponseEntity.status(HttpStatus.CREATED)
					.body(new ResponseSuccess(HttpStatus.CREATED, "Professional registration completed successfully!"));
			} catch (Exception ex) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
					"error", "professional_info_registration_failed",
					"message", ex.getMessage()
				));
			}
		});
	}

	@PostMapping("/refresh")
	@ResponseStatus(HttpStatus.OK)
	public ResponseSuccess refreshToken(@RequestBody Map<String, String> body) {
		String refreshToken = body.get("refresh_token");
		Map<String, Object> tokenResponse = authService.refreshToken(refreshToken);
		return new ResponseSuccess(HttpStatus.OK, "Refresh token successfully!", tokenResponse);
	}

	@PutMapping("/change-password")
	@ResponseStatus(HttpStatus.OK)
	public ResponseSuccess changePassword(@RequestBody ChangePasswordRequest req) {
		// Extract email from security context or request
		String email = req.getEmail(); // Assuming ChangePasswordRequest has email field
		authService.changePassword(email, req);
		return new ResponseSuccess(HttpStatus.OK, "Change password successfully!");
	}

	@PutMapping("/change-password-first-login")
	@ResponseStatus(HttpStatus.OK)
	public ResponseSuccess changePasswordOnFirstLogin(@Valid @RequestBody FirstLoginPasswordChangeRequest req) {
		String email = req.getEmail();
		authService.changePasswordOnFirstLogin(email, req);
		return new ResponseSuccess(HttpStatus.OK, "First login password changed successfully!");
	}

	@PostMapping("/forget-password")
	@ResponseStatus(HttpStatus.OK)
	public ResponseSuccess forgetPassword(@Valid @RequestBody ForgetPasswordRequest req) {
		String email = req.getEmail();
		try {
			authService.forgetPassword(email);
			return new ResponseSuccess(HttpStatus.OK, "Reset password email is being sent. Please check your email for the OTP code.");
		} catch (Exception e) {
			log.error("Error in forget password endpoint for email {}: {}", email, e.getMessage());
			throw e;
		}
	}

	@PostMapping("/reset-password")
	@ResponseStatus(HttpStatus.OK)
	public ResponseSuccess resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
		String email = req.getEmail(); // Changed from getUsername to getEmail
		authService.resetPassword(email, req.getOtp(), req.getNewPassword());
		return new ResponseSuccess(HttpStatus.OK, "Reset password successfully!");
	}

	@PostMapping("/logout")
	@ResponseStatus(HttpStatus.OK)
	public ResponseSuccess logout(@RequestBody(required = false) RefreshTokenRequest request) {
		String refreshToken = null;
		if (request != null) {
			refreshToken = request.getRefreshToken();
		}
		authService.logout(refreshToken); // Changed to single parameter
		return new ResponseSuccess(HttpStatus.OK, "Logout successfully!");
	}



	@PostMapping("/admin/approve-doctor/{userId}")
	@PreAuthorize("hasAuthority('APPROVE_DOCTOR')")
	public ResponseEntity<?> approveDoctorAccount(@PathVariable UUID userId) {
		try {
			authService.approveDoctorAccount(userId); // Changed to void return
			return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Doctor account approved successfully!"));
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
				"error", "approval_failed",
				"message", ex.getMessage()
			));
		}
	}

	@PostMapping("/admin/reject-doctor/{userId}")
	@PreAuthorize("hasAuthority('REJECT_DOCTOR')")
	public ResponseEntity<?> rejectDoctorAccount(@PathVariable UUID userId, @RequestBody Map<String, String> body) {
		try {
			String reason = body.getOrDefault("reason", "No reason provided");
			authService.rejectDoctorAccount(userId, reason);
			return ResponseEntity.ok(new ResponseSuccess(HttpStatus.OK, "Doctor account rejected successfully!"));
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
				"error", "rejection_failed",
				"message", ex.getMessage()
			));
		}
	}
}
