package com.example.HealthCare.service;

import java.math.BigDecimal;

public interface EmailService {
    void sendResetPasswordEmailAsync(String email, String username, String otp);
    
    // Additional email methods for UserAccount flow
    void sendOtpEmail(String email, String otp);
    void sendRejectionEmail(String email, String reason);
    void sendApprovalEmail(String email, String fullName, String password);
    void sendRefundNotificationEmail(String email, String patientName, BigDecimal refundAmount, String refundReason);
    void sendPayrollSettlementEmail(String email, String doctorName, Integer year, Integer month, 
                                    BigDecimal netSalary, BigDecimal grossRevenue, BigDecimal platformFee, int appointments);
}
