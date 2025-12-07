package com.example.HealthCare.controller;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.CreatePaymentRequest;
import com.example.HealthCare.enums.PaymentMethod;
import com.example.HealthCare.enums.PaymentStatus;
import com.example.HealthCare.model.Appointment;
import com.example.HealthCare.model.Payment;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.repository.PaymentRepository;
import com.example.HealthCare.repository.UserAccountRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserAccountRepository userAccountRepository;

    @PostMapping
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        try {
            UUID appointmentId = request.getAppointmentId();

            // Ensure appointment exists
            if (!appointmentRepository.existsById(appointmentId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Appointment not found"));
            }

            Payment payment = Payment.builder()
                    .appointmentId(appointmentId)
                    .amount(request.getTotalAmount())
                    .discount(null)
                    .tax(null)
                    .totalAmount(request.getTotalAmount())
                    .method(request.getMethod() != null ? PaymentMethod.fromValue(request.getMethod()) : PaymentMethod.VNPAY)
                    .status(request.getStatus() != null ? PaymentStatus.fromValue(request.getStatus()) : PaymentStatus.PAID)
                    .paymentTime(request.getPaymentTime() != null ? request.getPaymentTime() : OffsetDateTime.now())
                    .build();

            Payment saved = paymentRepository.save(payment);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", saved));
        } catch (Exception e) {
            log.error("Error creating payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Get payment history for current user (patient)
     * Retrieves all payments linked to the patient's appointments
     */
    @GetMapping("/my-payments")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> getMyPayments() {
        try {
            UUID userId = getCurrentUserId();
            
            // Fetch all payments and filter by user's appointments
            List<Payment> allPayments = paymentRepository.findAll();
            
            // Filter payments where appointment belongs to current user
            // Also convert to DTO to avoid Hibernate lazy loading issues
            List<Map<String, Object>> userPayments = allPayments.stream()
                    .filter(payment -> {
                        Appointment apt = appointmentRepository.findByIdWithRelations(payment.getAppointmentId());
                        return apt != null && userId.equals(apt.getPatientId());
                    })
                    .sorted((p1, p2) -> {
                        // Sort by payment time descending (newest first)
                        OffsetDateTime t1 = p1.getPaymentTime() != null ? p1.getPaymentTime() : OffsetDateTime.now();
                        OffsetDateTime t2 = p2.getPaymentTime() != null ? p2.getPaymentTime() : OffsetDateTime.now();
                        return t2.compareTo(t1);
                    })
                    .map(this::paymentToMap)
                    .collect(Collectors.toList());
            
            log.info("Retrieved {} payments for user {}", userPayments.size(), userId);
            
            return ResponseEntity.ok(Map.of("success", true, "data", userPayments));
        } catch (Exception e) {
            log.error("Error fetching payment history", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Convert Payment entity to a safe Map for JSON serialization
     * Avoids Hibernate lazy loading issues
     */
    private Map<String, Object> paymentToMap(Payment payment) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", payment.getId());
        map.put("appointmentId", payment.getAppointmentId());
        map.put("amount", payment.getAmount());
        map.put("totalAmount", payment.getTotalAmount());
        map.put("discount", payment.getDiscount());
        map.put("tax", payment.getTax());
        map.put("method", payment.getMethod() != null ? payment.getMethod().getValue() : "VNPAY");
        map.put("status", payment.getStatus() != null ? payment.getStatus().getValue() : "PENDING");
        map.put("paymentTime", payment.getPaymentTime());
        map.put("refundedAt", payment.getRefundedAt());
        map.put("refundReason", payment.getRefundReason());
        map.put("createdAt", payment.getCreatedAt());
        map.put("updatedAt", payment.getUpdatedAt());
        return map;
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        return userAccountRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
