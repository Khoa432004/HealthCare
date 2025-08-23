package com.example.HealthCare.service;

public interface EmailService {
    void sendResetPasswordEmailAsync(String email, String username, String otp);
}
