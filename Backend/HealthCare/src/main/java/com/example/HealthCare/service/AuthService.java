package com.example.HealthCare.service;

import java.util.Map;
import java.util.UUID;

import com.example.HealthCare.dto.request.ChangePasswordRequest;
import com.example.HealthCare.dto.request.FirstLoginPasswordChangeRequest;
import com.example.HealthCare.dto.request.PersonalInfoRequest;
import com.example.HealthCare.dto.request.ProfessionalInfoRequest;
import com.example.HealthCare.dto.request.RegisterRequest;
import com.example.HealthCare.dto.response.PersonalInfoResponse;

/**
 * Authentication Service - Refactored for UserAccount model
 * Changes:
 * - login now uses email instead of username
 * - logout simplified (single refreshToken parameter)
 * - changePassword uses email from ChangePasswordRequest
 * - Methods return void where Map<String, Object> was unnecessary
 */
public interface AuthService {
	// Authentication
	Map<String, Object> login(String email, String password);
	Map<String, Object> refreshToken(String refreshToken);
	void logout(String refreshToken);
	
	// Password management
	void changePassword(String email, ChangePasswordRequest request);
	void changePasswordOnFirstLogin(String email, FirstLoginPasswordChangeRequest request);
	void forgetPassword(String email);
	void resetPassword(String email, String otp, String newPassword);
	
	// Registration
	Map<String, Object> register(RegisterRequest registerRequest);
	
	// New 2-step registration methods (to be implemented)
	PersonalInfoResponse registerPersonalInfo(PersonalInfoRequest request);
	void registerProfessionalInfo(ProfessionalInfoRequest request);
	
	// Admin approval methods
	void approveDoctorAccount(UUID userId);
	void rejectDoctorAccount(UUID userId, String reason);
}
