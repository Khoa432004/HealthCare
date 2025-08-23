package com.example.HealthCare.service.impl;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.example.HealthCare.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    @Async("emailTaskExecutor")
    public void sendResetPasswordEmailAsync(String email, String username, String otp) {
        log.info("Starting async email sending to: {}", email);
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
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
            username, otp
        ));
        
        try {
            mailSender.send(message);
            log.info("Successfully sent reset password email to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send reset password email to {}: {}", email, e.getMessage(), e);
            // In production, you might want to add retry logic or dead letter queue
        }
    }
}
