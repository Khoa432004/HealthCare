package com.example.HealthCare.service.impl;

import com.example.HealthCare.dto.request.RefundRequest;
import com.example.HealthCare.dto.response.CanceledAppointmentResponse;
import com.example.HealthCare.enums.AppointmentStatus;
import com.example.HealthCare.enums.PaymentStatus;
import com.example.HealthCare.exception.ResourceNotFoundException;
import com.example.HealthCare.model.Appointment;
import com.example.HealthCare.model.Payment;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.repository.PaymentRepository;
import com.example.HealthCare.service.CanceledAppointmentService;
import com.example.HealthCare.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CanceledAppointmentServiceImpl implements CanceledAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;

    @Override
    @Transactional(readOnly = true)
    public Page<CanceledAppointmentResponse> getCanceledAppointments(String search, Pageable pageable) {
        // Get ALL appointments (not just canceled)
        log.info("Fetching all appointments with search: {}", search);
        
        List<Appointment> allAppointments = appointmentRepository.findAll();
        log.info("Total appointments in database: {}", allAppointments.size());
        
        // Start with all appointments
        List<Appointment> filteredAppointments = new ArrayList<>(allAppointments);

        // Apply search filter if provided
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase().trim();
            filteredAppointments = filteredAppointments.stream()
                    .filter(apt -> {
                        String doctorName = apt.getDoctor() != null 
                                ? apt.getDoctor().getFullName().toLowerCase() 
                                : "";
                        String patientName = apt.getPatient() != null 
                                ? apt.getPatient().getFullName().toLowerCase() 
                                : "";
                        String patientPhone = apt.getPatient() != null 
                                ? apt.getPatient().getPhoneNumber().toLowerCase() 
                                : "";
                        String reason = apt.getReason() != null 
                                ? apt.getReason().toLowerCase() 
                                : "";
                        String status = apt.getStatus() != null 
                                ? apt.getStatus().getValue().toLowerCase() 
                                : "";
                        
                        return doctorName.contains(searchLower) 
                                || patientName.contains(searchLower)
                                || patientPhone.contains(searchLower)
                                || reason.contains(searchLower)
                                || status.contains(searchLower)
                                || apt.getId().toString().toLowerCase().contains(searchLower);
                    })
                    .collect(Collectors.toList());
        }

        // Sort by scheduledStart desc (newest first)
        filteredAppointments.sort((a1, a2) -> {
            if (a1.getScheduledStart() == null) return 1;
            if (a2.getScheduledStart() == null) return -1;
            return a2.getScheduledStart().compareTo(a1.getScheduledStart());
        });

        // Map to response
        List<CanceledAppointmentResponse> responses = filteredAppointments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        // Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());
        
        List<CanceledAppointmentResponse> pageContent = start > responses.size() 
                ? List.of() 
                : responses.subList(start, end);

        return new PageImpl<>(pageContent, pageable, responses.size());
    }

    @Override
    @Transactional
    public void processRefund(RefundRequest request) {
        log.info("Processing refund for payment: {} and appointment: {}", 
                request.getPaymentId(), request.getAppointmentId());

        // Verify appointment is canceled
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.CANCELED) {
            throw new IllegalStateException("Appointment is not canceled");
        }

        // Verify and update payment
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            throw new IllegalStateException("Payment already refunded");
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException("Payment must be in PENDING status to refund");
        }

        // Update payment status to REFUNDED
        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        // Send refund notification email to patient
        if (appointment.getPatient() != null && appointment.getPatient().getEmail() != null) {
            String patientEmail = appointment.getPatient().getEmail();
            String patientName = appointment.getPatient().getFullName();
            
            log.info("Sending refund notification email to patient: {}", patientEmail);
            emailService.sendRefundNotificationEmail(
                patientEmail, 
                patientName, 
                payment.getTotalAmount(),
                request.getRefundReason()
            );
        } else {
            log.warn("Cannot send refund notification email - patient email not found for appointment: {}", 
                appointment.getId());
        }

        log.info("Refund processed successfully for payment: {}", payment.getId());
    }

    private CanceledAppointmentResponse mapToResponse(Appointment appointment) {
        // Find payment for this appointment
        Optional<Payment> paymentOpt = paymentRepository.findAll().stream()
                .filter(p -> p.getAppointment() != null && p.getAppointment().getId().equals(appointment.getId()))
                .findFirst();

        return CanceledAppointmentResponse.builder()
                .appointmentId(appointment.getId())
                .scheduledStart(appointment.getScheduledStart())
                .scheduledEnd(appointment.getScheduledEnd())
                .doctorName(appointment.getDoctor() != null 
                        ? appointment.getDoctor().getFullName() 
                        : "N/A")
                .patientName(appointment.getPatient() != null 
                        ? appointment.getPatient().getFullName() 
                        : "N/A")
                .patientPhone(appointment.getPatient() != null 
                        ? appointment.getPatient().getPhoneNumber() 
                        : "N/A")
                .cancellationReason(appointment.getCancellationReason() != null 
                        ? appointment.getCancellationReason() 
                        : "")
                .canceledAt(appointment.getCanceledAt())
                .appointmentStatus(appointment.getStatus() != null 
                        ? appointment.getStatus().getValue() 
                        : "unknown")
                .canceledBy(appointment.getCancellationBy() != null 
                        ? appointment.getCancellationBy() 
                        : "Không rõ")
                .paymentStatus(paymentOpt.map(p -> p.getStatus().getValue()).orElse("No payment"))
                .totalAmount(paymentOpt.map(Payment::getTotalAmount).orElse(null))
                .paymentId(paymentOpt.map(Payment::getId).orElse(null))
                .build();
    }
}

