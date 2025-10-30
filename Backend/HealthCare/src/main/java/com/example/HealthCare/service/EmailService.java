package com.example.HealthCare.service;

public interface EmailService {
    void sendResetPasswordEmailAsync(String email, String username, String otp);
    
    // Additional email methods for UserAccount flow
    void sendOtpEmail(String email, String otp);
    void sendRejectionEmail(String email, String reason);
    void sendApprovalEmail(String email, String fullName, String password);
}
