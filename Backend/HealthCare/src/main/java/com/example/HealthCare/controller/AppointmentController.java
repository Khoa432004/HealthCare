package com.example.HealthCare.controller;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.CreateAppointmentRequest;
import com.example.HealthCare.dto.request.CreateAppointmentFromBookingRequest;
import com.example.HealthCare.dto.request.RescheduleAppointmentRequest;
import com.example.HealthCare.dto.response.AppointmentResponse;
import com.example.HealthCare.dto.response.AvailableSlotsResponse;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.AppointmentService;
import com.example.HealthCare.model.Payment;
import com.example.HealthCare.enums.PaymentMethod;
import com.example.HealthCare.enums.PaymentStatus;
import com.example.HealthCare.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@Slf4j
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserAccountRepository userAccountRepository;
    private final PaymentRepository paymentRepository;


    @GetMapping("/my-appointments")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> getMyAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate) {
        try {
            UUID userId = getCurrentUserId();
            UserAccount user = userAccountRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            String userRole = user.getRole() != null ? user.getRole().getValue() : "PATIENT";
            
            // Default to current month if no date range provided
            OffsetDateTime defaultStartDate = startDate;
            OffsetDateTime defaultEndDate = endDate;
            
            if (defaultStartDate == null || defaultEndDate == null) {
                OffsetDateTime now = OffsetDateTime.now();
                if (defaultStartDate == null) {
                    defaultStartDate = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                }
                if (defaultEndDate == null) {
                    defaultEndDate = now.withDayOfMonth(now.toLocalDate().lengthOfMonth())
                            .withHour(23).withMinute(59).withSecond(59);
                }
            }
            
            List<AppointmentResponse> appointments = appointmentService.getMyAppointments(
                    userId, 
                    userRole, 
                    defaultStartDate, 
                    defaultEndDate
            );
            
            return ResponseEntity.ok(Map.of("success", true, "data", appointments));
        } catch (Exception e) {
            log.error("Error getting appointments", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> createAppointment(@RequestBody CreateAppointmentRequest request) {
        try {
            UUID doctorId = getCurrentUserId();
            
            // Validate that current user is a doctor
            UserAccount doctor = userAccountRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (doctor.getRole() == null || !"DOCTOR".equalsIgnoreCase(doctor.getRole().getValue())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Only doctors can create appointments"));
            }
            
            AppointmentResponse appointment = appointmentService.createAppointment(request, doctorId);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ResponseSuccess(HttpStatus.CREATED, "Appointment created successfully", appointment));
        } catch (com.example.HealthCare.exception.BadRequestException e) {
            log.error("Bad request when creating appointment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "bad_request", "message", e.getMessage()));
        } catch (com.example.HealthCare.exception.NotFoundException e) {
            log.error("Not found when creating appointment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "not_found", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating appointment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> getAppointmentById(@PathVariable UUID id) {
        try {
            UUID userId = getCurrentUserId();
            AppointmentResponse appointment = appointmentService.getAppointmentById(id, userId);
            
            return ResponseEntity.ok(Map.of("success", true, "data", appointment));
        } catch (com.example.HealthCare.exception.NotFoundException e) {
            log.error("Appointment not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "not_found", "message", e.getMessage()));
        } catch (com.example.HealthCare.exception.BadRequestException e) {
            log.error("Bad request when getting appointment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "error", "forbidden", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting appointment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Confirm/start an appointment (change status to IN_PROCESS)
     * @param id - Appointment ID
     * @return Updated appointment details
     */
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> confirmAppointment(@PathVariable UUID id) {
        try {
            UUID doctorId = getCurrentUserId();
            
            // Validate that current user is a doctor
            UserAccount doctor = userAccountRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (doctor.getRole() == null || !"DOCTOR".equalsIgnoreCase(doctor.getRole().getValue())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Only doctors can confirm appointments"));
            }
            
            AppointmentResponse appointment = appointmentService.confirmAppointment(id, doctorId);
            
            return ResponseEntity.ok(Map.of("success", true, "data", appointment));
        } catch (com.example.HealthCare.exception.NotFoundException e) {
            log.error("Appointment not found when confirming: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "not_found", "message", e.getMessage()));
        } catch (com.example.HealthCare.exception.BadRequestException e) {
            log.error("Bad request when confirming appointment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "bad_request", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error confirming appointment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Patient booking endpoint - creates appointment from VNPay booking flow
     * This endpoint is called by the frontend after successful payment
     * @param request - Booking request with doctor ID, date, reason, symptoms etc.
     * @return Created appointment
     */
    @PostMapping("/book-from-payment")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> bookAppointmentFromPayment(@RequestBody CreateAppointmentFromBookingRequest request) {
        try {
            UUID patientId = getCurrentUserId();
            UserAccount patient = userAccountRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            
            // Convert booking request to appointment creation request
            CreateAppointmentRequest appointmentRequest = CreateAppointmentRequest.builder()
                    .patientId(patientId)
                    .scheduledStart(request.getScheduledStart())
                    .scheduledEnd(request.getScheduledEnd())
                    .reason(request.getReason())
                    .symptomsOns(request.getSymptomsOns())
                    .symptomsSever(request.getSymptomsSever())
                    .currentMedication(request.getCurrentMedication())
                    .build();
            
            // Create appointment with doctor ID as the appointment doctor
            AppointmentResponse appointment = appointmentService.createAppointment(appointmentRequest, request.getDoctorId());

            // If payment information was provided in the booking request, persist a Payment record
            try {
                if (request.getTotalAmount() != null) {
                    UUID appointmentId = appointment.getId();
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

                    paymentRepository.save(payment);
                }
            } catch (Exception ex) {
                log.warn("Failed to persist payment record after booking: {}", ex.getMessage());
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ResponseSuccess(HttpStatus.CREATED, "Appointment created successfully", appointment));
        } catch (com.example.HealthCare.exception.BadRequestException e) {
            log.error("Bad request when booking appointment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "bad_request", "message", e.getMessage()));
        } catch (com.example.HealthCare.exception.NotFoundException e) {
            log.error("Not found when booking appointment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "not_found", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error booking appointment from payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Get available time slots for a doctor on a specific date
     * @param doctorId - Doctor ID
     * @param date - Date in format yyyy-MM-dd
     * @param excludeAppointmentId - Optional appointment ID to exclude from conflicts (for rescheduling)
     * @return Available slots
     */
    @GetMapping("/available-slots")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> getAvailableSlots(
            @RequestParam UUID doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) UUID excludeAppointmentId) {
        try {
            AvailableSlotsResponse response = appointmentService.getAvailableSlots(doctorId, date, excludeAppointmentId);
            return ResponseEntity.ok(Map.of("success", true, "data", response));
        } catch (Exception e) {
            log.error("Error getting available slots", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Cancel an appointment (patient only)
     * @param id - Appointment ID
     * @param request - Cancel request with optional cancellation reason
     * @return Updated appointment details
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> cancelAppointment(@PathVariable UUID id, @RequestBody(required = false) Map<String, String> request) {
        try {
            UUID patientId = getCurrentUserId();
            
            // Validate that current user is a patient
            UserAccount user = userAccountRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (user.getRole() == null || !"PATIENT".equalsIgnoreCase(user.getRole().getValue())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Only patients can cancel appointments"));
            }
            
            String cancellationReason = request != null ? request.get("cancellationReason") : null;
            AppointmentResponse appointment = appointmentService.cancelAppointment(id, patientId, cancellationReason);
            
            return ResponseEntity.ok(Map.of("success", true, "data", appointment));
        } catch (com.example.HealthCare.exception.NotFoundException e) {
            log.error("Appointment not found when canceling: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "not_found", "message", e.getMessage()));
        } catch (com.example.HealthCare.exception.BadRequestException e) {
            log.error("Bad request when canceling appointment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "bad_request", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error canceling appointment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Reschedule an appointment (patient only)
     * @param id - Appointment ID
     * @param request - Reschedule request with new scheduled start and end times
     * @return Updated appointment details
     */
    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> rescheduleAppointment(@PathVariable UUID id, @RequestBody RescheduleAppointmentRequest request) {
        try {
            UUID patientId = getCurrentUserId();
            
            // Validate that current user is a patient
            UserAccount user = userAccountRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (user.getRole() == null || !"PATIENT".equalsIgnoreCase(user.getRole().getValue())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Only patients can reschedule appointments"));
            }
            
            AppointmentResponse appointment = appointmentService.rescheduleAppointment(id, patientId, request);
            
            return ResponseEntity.ok(Map.of("success", true, "data", appointment));
        } catch (com.example.HealthCare.exception.NotFoundException e) {
            log.error("Appointment not found when rescheduling: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "not_found", "message", e.getMessage()));
        } catch (com.example.HealthCare.exception.BadRequestException e) {
            log.error("Bad request when rescheduling appointment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "bad_request", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error rescheduling appointment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return user.getId();
    }
}

