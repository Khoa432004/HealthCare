package com.example.HealthCare.controller;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.CreatePaymentRequest;
import com.example.HealthCare.enums.PaymentMethod;
import com.example.HealthCare.enums.PaymentStatus;
import com.example.HealthCare.model.Payment;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.repository.PaymentRepository;

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
}
