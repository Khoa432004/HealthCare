package com.example.HealthCare.controller;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

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

import com.example.HealthCare.dto.request.PurchasePackageFromPaymentRequest;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.enums.PaymentMethod;
import com.example.HealthCare.enums.PaymentStatus;
import com.example.HealthCare.model.PackagePurchasePayment;
import com.example.HealthCare.model.PatientExamPackagePurchase;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.PackagePurchasePaymentRepository;
import com.example.HealthCare.repository.PatientExamPackagePurchaseRepository;
import com.example.HealthCare.repository.UserAccountRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/patient-packages")
@RequiredArgsConstructor
@Slf4j
public class PatientPackageController {

    private final PatientExamPackagePurchaseRepository packagePurchaseRepository;
    private final PackagePurchasePaymentRepository paymentRepository;
    private final UserAccountRepository userAccountRepository;

    /**
     * Patient purchasing package endpoint - creates package purchase from VNPay booking flow
     * This endpoint is called by the frontend after successful payment
     * 
     * @param request - Package purchase request with doctor ID, package info, and optional payment details
     * @return Created package purchase
     */
    @PostMapping("/purchase-from-payment")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> purchasePackageFromPayment(@Valid @RequestBody PurchasePackageFromPaymentRequest request) {
        try {
            // Extract patient ID from JWT token (authenticated user)
            UUID patientId = getCurrentUserId();
            log.info("Patient {} purchasing package {} from doctor {}", patientId, request.getPackageId(), request.getDoctorId());

            // Calculate expiration date: purchase date + duration days
            OffsetDateTime purchaseDate = OffsetDateTime.now();
            OffsetDateTime expirationDate = purchaseDate.plusDays(request.getDurationDays());

            // Create package purchase record
            PatientExamPackagePurchase purchase = PatientExamPackagePurchase.builder()
                    .patientId(patientId)
                    .doctorId(request.getDoctorId())
                    .packageId(request.getPackageId())
                    .packageName(request.getPackageName())
                    .durationDays(request.getDurationDays())
                    .priceVnd(request.getPriceVnd())
                    .purchaseDate(purchaseDate)
                    .expirationDate(expirationDate)
                    .status("active")
                    .remainingMessages(12)
                    .remainingSessions(4)
                    .build();

            PatientExamPackagePurchase savedPurchase = packagePurchaseRepository.save(purchase);
            log.info("Package purchase created: {}", savedPurchase.getId());

            // If payment information was provided in the booking request, persist a PackagePurchasePayment record
            if (request.getTotalAmount() != null) {
                UUID purchaseId = savedPurchase.getId();
                log.info("Creating payment record for package purchase {}", purchaseId);

                try {
                    // Parse payment method and status from request
                    PaymentMethod paymentMethod = request.getMethod() != null 
                        ? PaymentMethod.fromValue(request.getMethod()) 
                        : PaymentMethod.VNPAY;
                    PaymentStatus paymentStatus = request.getStatus() != null 
                        ? PaymentStatus.fromValue(request.getStatus()) 
                        : PaymentStatus.PAID;

                    PackagePurchasePayment payment = PackagePurchasePayment.builder()
                            .packagePurchaseId(purchaseId)
                            .amount(request.getTotalAmount())
                            .totalAmount(request.getTotalAmount())
                            .discount(BigDecimal.ZERO)
                            .tax(BigDecimal.ZERO)
                            .method(paymentMethod)
                            .status(paymentStatus)
                            .transactionId(request.getTransactionId())
                            .transactionRef(request.getTransactionRef())
                            .paymentTime(request.getPaymentTime() != null ? request.getPaymentTime() : OffsetDateTime.now())
                            .build();

                    PackagePurchasePayment savedPayment = paymentRepository.save(payment);
                    log.info("Payment record created: {}", savedPayment.getId());
                    
                    // Update purchase to link payment
                    savedPurchase.setPayment(savedPayment);
                    packagePurchaseRepository.save(savedPurchase);
                } catch (Exception ex) {
                    // Log payment creation error but don't fail the whole transaction
                    log.error("Failed to create payment record for package purchase {}: {}", purchaseId, ex.getMessage());
                }
            }

            return ResponseEntity.ok(new ResponseSuccess(
                    HttpStatus.CREATED,
                    "Package purchase created successfully",
                    savedPurchase
            ));

        } catch (Exception e) {
            log.error("Error creating package purchase:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ResponseSuccess(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to create package purchase: " + e.getMessage(),
                            null
                    )
            );
        }
    }

    /**
     * Get patient's purchased packages
     */
    @GetMapping("/my-packages")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> getMyPackages() {
        try {
            UUID patientId = getCurrentUserId();
            log.info("Fetching packages for patient {}", patientId);

            List<PatientExamPackagePurchase> purchases = packagePurchaseRepository
                    .findByPatientIdOrderByPurchaseDateDesc(patientId);

            return ResponseEntity.ok(new ResponseSuccess(
                    HttpStatus.OK,
                    "Packages retrieved successfully",
                    purchases
            ));
        } catch (Exception e) {
            log.error("Error fetching patient packages:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new ResponseSuccess(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to fetch packages: " + e.getMessage(),
                            null
                    )
            );
        }
    }

    /**
     * Get current authenticated user ID from JWT token
     */
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
