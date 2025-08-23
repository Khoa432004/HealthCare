package com.example.HealthCare.service;

import java.util.Map;

import com.example.HealthCare.dto.request.ChangePasswordRequest;
import com.example.HealthCare.dto.request.PersonalInfoRequest;
import com.example.HealthCare.dto.request.ProfessionalInfoRequest;
import com.example.HealthCare.dto.request.RegisterRequest;
import com.example.HealthCare.dto.response.PersonalInfoResponse;

public interface AuthService {
	Map<String, Object> login(String username, String password);
	Map<String, Object> refreshToken(String refreshToken);
	void changePassword(ChangePasswordRequest req);
	void logout(String accessToken, String refreshToken);
	void sendResetPasswordEmail(String username);
	void resetPasswordWithOtp(String username, String otp, String newPassword);
	Map<String, Object> register(RegisterRequest registerRequest);
	
	// New 2-step registration methods
	PersonalInfoResponse registerPersonalInfo(PersonalInfoRequest request);
	PersonalInfoResponse getPersonalInfoByIdentityCard(String identityCard);
	Map<String, Object> registerProfessionalInfo(ProfessionalInfoRequest request);
	
	// Admin approval methods
	Map<String, Object> approveDoctorAccount(Long userId);
	Map<String, Object> rejectDoctorAccount(Long userId, String reason);
}
