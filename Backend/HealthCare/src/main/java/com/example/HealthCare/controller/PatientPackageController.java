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
import com.example.HealthCare.dto.response.DoctorProfileDto;
import com.example.HealthCare.dto.response.DoctorSummaryDto;
import com.example.HealthCare.dto.response.PatientExamPackagePurchaseDto;
import com.example.HealthCare.dto.response.PatientSummaryDto;
import com.example.HealthCare.dto.response.PaymentDto;
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

                // Map entities to DTOs to avoid exposing JPA internals and prevent cycles
                List<PatientExamPackagePurchaseDto> dtoList = purchases.stream()
                    .map(this::toDto)
                    .toList();

                return ResponseEntity.ok(new ResponseSuccess(
                    HttpStatus.OK,
                    "Packages retrieved successfully",
                    dtoList
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

    private PatientExamPackagePurchaseDto toDto(PatientExamPackagePurchase p) {
        PatientExamPackagePurchaseDto dto = new PatientExamPackagePurchaseDto();
        dto.setId(p.getId());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        dto.setPatientId(p.getPatientId());
        dto.setDoctorId(p.getDoctorId());
        dto.setPackageId(p.getPackageId());
        dto.setPackageName(p.getPackageName());
        dto.setDurationDays(p.getDurationDays());
        dto.setPriceVnd(p.getPriceVnd());
        dto.setPurchaseDate(p.getPurchaseDate());
        dto.setExpirationDate(p.getExpirationDate());
        dto.setStatus(p.getStatus());
        dto.setRemainingMessages(p.getRemainingMessages());
        dto.setRemainingSessions(p.getRemainingSessions());

        // Map doctor summary if available
        if (p.getDoctor() != null) {
            DoctorSummaryDto d = new DoctorSummaryDto();
            d.setId(p.getDoctor().getId());
            d.setCreatedAt(p.getDoctor().getCreatedAt());
            d.setUpdatedAt(p.getDoctor().getUpdatedAt());
            d.setRole(p.getDoctor().getRole() != null ? p.getDoctor().getRole().name() : null);
            d.setStatus(p.getDoctor().getStatus() != null ? p.getDoctor().getStatus().name() : null);
            d.setFullName(p.getDoctor().getFullName());
            d.setGender(p.getDoctor().getGender() != null ? p.getDoctor().getGender().name() : null);
            d.setDateOfBirth(p.getDoctor().getDateOfBirth());
            d.setEmail(p.getDoctor().getEmail());
            d.setPhoneNumber(p.getDoctor().getPhoneNumber());

            if (p.getDoctor().getDoctorProfile() != null) {
                DoctorProfileDto dp = new DoctorProfileDto();
                dp.setPracticeLicenseNo(p.getDoctor().getDoctorProfile().getPracticeLicenseNo());
                dp.setCccdNumber(p.getDoctor().getDoctorProfile().getCccdNumber());
                dp.setTitle(p.getDoctor().getDoctorProfile().getTitle());
                dp.setWorkplaceName(p.getDoctor().getDoctorProfile().getWorkplaceName());
                dp.setFacilityName(p.getDoctor().getDoctorProfile().getFacilityName());
                dp.setClinicAddress(p.getDoctor().getDoctorProfile().getClinicAddress());
                dp.setCareTarget(p.getDoctor().getDoctorProfile().getCareTarget());
                dp.setSpecialties(p.getDoctor().getDoctorProfile().getSpecialties());
                dp.setDiseasesTreated(p.getDoctor().getDoctorProfile().getDiseasesTreated());
                dp.setEducationSummary(p.getDoctor().getDoctorProfile().getEducationSummary());
                dp.setTrainingInstitution(p.getDoctor().getDoctorProfile().getTrainingInstitution());
                dp.setGraduationYear(p.getDoctor().getDoctorProfile().getGraduationYear());
                dp.setMajor(p.getDoctor().getDoctorProfile().getMajor());
                dp.setAddress(p.getDoctor().getDoctorProfile().getAddress());
                dp.setProvince(p.getDoctor().getDoctorProfile().getProvince());
                dp.setConsultationFee(p.getDoctor().getDoctorProfile().getConsultationFee());
                d.setDoctorProfile(dp);
            }

            dto.setDoctor(d);
        }

        // Map patient summary if available
        if (p.getPatient() != null) {
            PatientSummaryDto ps = new PatientSummaryDto();
            ps.setId(p.getPatient().getId());
            ps.setCreatedAt(p.getPatient().getCreatedAt());
            ps.setUpdatedAt(p.getPatient().getUpdatedAt());
            ps.setRole(p.getPatient().getRole() != null ? p.getPatient().getRole().name() : null);
            ps.setStatus(p.getPatient().getStatus() != null ? p.getPatient().getStatus().name() : null);
            ps.setFullName(p.getPatient().getFullName());
            ps.setGender(p.getPatient().getGender() != null ? p.getPatient().getGender().name() : null);
            ps.setDateOfBirth(p.getPatient().getDateOfBirth());
            ps.setEmail(p.getPatient().getEmail());
            ps.setPhoneNumber(p.getPatient().getPhoneNumber());
            dto.setPatient(ps);
        }

        // Map payment summary if available
        if (p.getPayment() != null) {
            PaymentDto pay = new PaymentDto();
            pay.setId(p.getPayment().getId());
            pay.setCreatedAt(p.getPayment().getCreatedAt());
            pay.setUpdatedAt(p.getPayment().getUpdatedAt());
            pay.setPackagePurchaseId(p.getPayment().getPackagePurchaseId());
            pay.setAmount(p.getPayment().getAmount());
            pay.setDiscount(p.getPayment().getDiscount());
            pay.setTax(p.getPayment().getTax());
            pay.setTotalAmount(p.getPayment().getTotalAmount());
            pay.setMethod(p.getPayment().getMethod() != null ? p.getPayment().getMethod().name() : null);
            pay.setStatus(p.getPayment().getStatus() != null ? p.getPayment().getStatus().name() : null);
            pay.setTransactionId(p.getPayment().getTransactionId());
            pay.setTransactionRef(p.getPayment().getTransactionRef());
            pay.setPaymentTime(p.getPayment().getPaymentTime());
            dto.setPayment(pay);
        }

        return dto;
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
