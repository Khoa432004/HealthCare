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
    
    @Override
    @Async("emailTaskExecutor")
    public void sendOtpEmail(String email, String otp) {
        log.info("Sending OTP email to: {}", email);
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("HealthCare - Your OTP Code");
        message.setText(String.format(
            """
            Hello,

            Your OTP (One-Time Password) for HealthCare is: %s

            This code will expire in 15 minutes.

            If you did not request this, please ignore this email.

            Best regards,
            HealthCare Team""",
            otp
        ));
        
        try {
            mailSender.send(message);
            log.info("Successfully sent OTP email to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", email, e.getMessage(), e);
        }
    }
    
    @Override
    @Async("emailTaskExecutor")
    public void sendRejectionEmail(String email, String reason) {
        log.info("Sending rejection email to: {}", email);
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("HealthCare - Account Application Status");
        message.setText(String.format(
            """
            Hello,

            We regret to inform you that your account application has been rejected.

            Reason: %s

            If you have any questions, please contact our support team.

            Best regards,
            HealthCare Team""",
            reason
        ));
        
        try {
            mailSender.send(message);
            log.info("Successfully sent rejection email to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send rejection email to {}: {}", email, e.getMessage(), e);
        }
    }
    
    @Override
    @Async("emailTaskExecutor")
    public void sendApprovalEmail(String email, String fullName, String password) {
        log.info("Sending approval email to: {}", email);
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("HealthCare - Tài khoản đã được phê duyệt");
        message.setText(String.format(
            """
            Xin chào %s,

            Tài khoản của bạn đã được phê duyệt thành công!

            Thông tin đăng nhập:
            Email: %s
            Mật khẩu tạm thời: %s

            Vui lòng đăng nhập và thay đổi mật khẩu trong lần đăng nhập đầu tiên.

            Trân trọng,
            Đội ngũ HealthCare""",
            fullName, email, password
        ));
        
        try {
            mailSender.send(message);
            log.info("Successfully sent approval email to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send approval email to {}: {}", email, e.getMessage(), e);
        }
    }
}
