package com.example.HealthCare.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.PayrollFilterRequest;
import com.example.HealthCare.dto.request.SettlePayrollRequest;
import com.example.HealthCare.dto.response.DoctorPayrollResponse;
import com.example.HealthCare.enums.AppointmentStatus;
import com.example.HealthCare.enums.PaymentStatus;
import com.example.HealthCare.enums.PayrollStatus;
import com.example.HealthCare.model.Appointment;
import com.example.HealthCare.model.DoctorPayroll;
import com.example.HealthCare.model.DoctorProfile;
import com.example.HealthCare.model.Payment;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.repository.DoctorPayrollRepository;
import com.example.HealthCare.repository.DoctorProfileRepository;
import com.example.HealthCare.repository.PaymentRepository;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.EmailService;
import com.example.HealthCare.service.PayrollService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollServiceImpl implements PayrollService {

    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final DoctorPayrollRepository doctorPayrollRepository;
    private final UserAccountRepository userAccountRepository;
    private final EmailService emailService;

    private static final BigDecimal PLATFORM_FEE_PERCENTAGE = new BigDecimal("0.15");
    private static final BigDecimal DOCTOR_SALARY_PERCENTAGE = new BigDecimal("0.85");

    @Override
    @Transactional(readOnly = true)
    public List<DoctorPayrollResponse> getDoctorPayrolls(PayrollFilterRequest request) {
        log.info("Getting doctor payrolls for year: {}, month: {}, search: {}", 
                request.getYear(), request.getMonth(), request.getSearch());

        // Get current date
        LocalDate currentDate = LocalDate.now();

        // Get all doctor profiles
        List<DoctorProfile> doctorProfiles = doctorProfileRepository.findAll();

        List<DoctorPayrollResponse> payrolls = new ArrayList<>();

        for (DoctorProfile profile : doctorProfiles) {
            UserAccount doctor = profile.getUserAccount();
            if (doctor == null) {
                continue;
            }

            // Get appointments for this doctor in the specified period
            List<Appointment> appointments = getCompletedAppointmentsForPeriod(
                    profile.getUserId(), request.getYear(), request.getMonth());

            // Calculate stats
            int completedAppointments = appointments.size();
            
            // Get total revenue from payments (only PAID payments)
            BigDecimal totalRevenue = calculateTotalRevenue(appointments);
            
            // Get total refunds (from cancelled appointments in the same period)
            BigDecimal refunds = calculateTotalRefunds(profile.getUserId(), request.getYear(), request.getMonth());

            // Calculate platform fee (15%)
            BigDecimal platformFee = totalRevenue.multiply(PLATFORM_FEE_PERCENTAGE)
                    .setScale(0, RoundingMode.HALF_UP);

            // Calculate doctor salary (85%)
            BigDecimal doctorSalary = totalRevenue.multiply(DOCTOR_SALARY_PERCENTAGE)
                    .setScale(0, RoundingMode.HALF_UP);

            // Check if payroll already exists
            Optional<DoctorPayroll> existingPayroll = doctorPayrollRepository.findByDoctorIdAndPeriodYearAndPeriodMonth(
                    profile.getUserId(), request.getYear(), request.getMonth());

            String paymentStatus = existingPayroll.isPresent() 
                    ? existingPayroll.get().getStatus().getValue() 
                    : "UNSETTLED";

            UUID payrollId = existingPayroll.map(DoctorPayroll::getId).orElse(null);

            // Check if can settle (current date >= end of selected month)
            LocalDate endOfMonth = YearMonth.of(request.getYear(), request.getMonth()).atEndOfMonth();
            boolean canSettle = !currentDate.isBefore(endOfMonth);

            // Apply search filter
            if (request.getSearch() != null && !request.getSearch().trim().isEmpty()) {
                String searchLower = request.getSearch().toLowerCase().trim();
                String doctorName = doctor.getFullName().toLowerCase();
                String email = doctor.getEmail().toLowerCase();
                String phone = doctor.getPhoneNumber() != null ? doctor.getPhoneNumber().toLowerCase() : "";

                if (!doctorName.contains(searchLower) && !email.contains(searchLower) 
                        && !phone.contains(searchLower)) {
                    continue;
                }
            }

            payrolls.add(DoctorPayrollResponse.builder()
                    .doctorId(profile.getUserId())
                    .doctorName(doctor.getFullName())
                    .email(doctor.getEmail())
                    .phoneNumber(doctor.getPhoneNumber())
                    .completedAppointments(completedAppointments)
                    .totalRevenue(totalRevenue)
                    .refunds(refunds)
                    .platformFee(platformFee)
                    .doctorSalary(doctorSalary)
                    .paymentStatus(paymentStatus)
                    .payrollId(payrollId)
                    .canSettle(canSettle)
                    .build());
        }

        log.info("Found {} doctors for payroll", payrolls.size());
        return payrolls;
    }

    @Override
    @Transactional
    public void settlePayroll(SettlePayrollRequest request) {
        log.info("Settling payroll for doctor: {}, year: {}, month: {}", 
                request.getDoctorId(), request.getYear(), request.getMonth());

        // Get doctor info
        UserAccount doctor = userAccountRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Check if already settled
        Optional<DoctorPayroll> existingPayrollOpt = doctorPayrollRepository.findByDoctorIdAndPeriodYearAndPeriodMonth(
                request.getDoctorId(), request.getYear(), request.getMonth());

        if (!existingPayrollOpt.isPresent()) {
            log.error("Cannot settle - no payroll record found for doctor: {}, year: {}, month: {}", 
                    request.getDoctorId(), request.getYear(), request.getMonth());
            throw new IllegalStateException("No payroll record found. Cannot settle.");
        }

        DoctorPayroll existingPayroll = existingPayrollOpt.get();
        
        if (existingPayroll.getStatus() == PayrollStatus.SETTLED) {
            log.warn("Payroll already settled for doctor: {}, year: {}, month: {}", 
                    request.getDoctorId(), request.getYear(), request.getMonth());
            throw new IllegalStateException("Payroll already settled for this period");
        }

        // Just update status from UNSETTLED to SETTLED
        existingPayroll.setStatus(PayrollStatus.SETTLED);
        doctorPayrollRepository.save(existingPayroll);
        
        // Send email notification to doctor
        if (doctor.getEmail() != null) {
            log.info("Sending payroll settlement email to doctor: {}", doctor.getEmail());
            emailService.sendPayrollSettlementEmail(
                doctor.getEmail(),
                doctor.getFullName(),
                request.getYear(),
                request.getMonth(),
                existingPayroll.getNetAmount(),
                existingPayroll.getGrossAmount(),
                existingPayroll.getPlatformFee(),
                0 // We don't have appointment count here, can be added if needed
            );
        } else {
            log.warn("Cannot send payroll settlement email - doctor email not found");
        }
        
        log.info("Payroll settled successfully for doctor: {}", request.getDoctorId());
    }

    private List<Appointment> getCompletedAppointmentsForPeriod(UUID doctorId, Integer year, Integer month) {
        // Get all appointments for this doctor
        List<Appointment> allAppointments = appointmentRepository.findAll();
        
        return allAppointments.stream()
                .filter(apt -> apt.getDoctorId().equals(doctorId))
                .filter(apt -> apt.getStatus() == AppointmentStatus.COMPLETED)
                .filter(apt -> {
                    if (apt.getScheduledStart() == null) {
                        return false;
                    }
                    LocalDate scheduledDate = apt.getScheduledStart().toLocalDate();
                    return scheduledDate.getYear() == year && scheduledDate.getMonthValue() == month;
                })
                .collect(Collectors.toList());
    }

    private BigDecimal calculateTotalRevenue(List<Appointment> appointments) {
        BigDecimal total = BigDecimal.ZERO;

        for (Appointment appointment : appointments) {
            // Find payment for this appointment
            List<Payment> allPayments = paymentRepository.findAll();
            Optional<Payment> paymentOpt = allPayments.stream()
                    .filter(p -> p.getAppointment() != null 
                            && p.getAppointment().getId().equals(appointment.getId())
                            && p.getStatus() == PaymentStatus.PAID)
                    .findFirst();

            if (paymentOpt.isPresent()) {
                total = total.add(paymentOpt.get().getTotalAmount());
            }
        }

        return total;
    }

    private BigDecimal calculateTotalRefunds(UUID doctorId, Integer year, Integer month) {
        BigDecimal total = BigDecimal.ZERO;
        
        // Get all canceled appointments for this doctor in the specified period
        List<Appointment> allAppointments = appointmentRepository.findAll();
        List<Appointment> canceledAppointments = allAppointments.stream()
                .filter(apt -> apt.getDoctorId().equals(doctorId))
                .filter(apt -> apt.getStatus() == AppointmentStatus.CANCELED)
                .filter(apt -> {
                    if (apt.getScheduledStart() == null) {
                        return false;
                    }
                    LocalDate scheduledDate = apt.getScheduledStart().toLocalDate();
                    return scheduledDate.getYear() == year && scheduledDate.getMonthValue() == month;
                })
                .collect(Collectors.toList());

        for (Appointment appointment : canceledAppointments) {
            // Find payment for this appointment with REFUNDED status
            List<Payment> allPayments = paymentRepository.findAll();
            Optional<Payment> paymentOpt = allPayments.stream()
                    .filter(p -> p.getAppointment() != null 
                            && p.getAppointment().getId().equals(appointment.getId())
                            && p.getStatus() == PaymentStatus.REFUNDED)
                    .findFirst();

            if (paymentOpt.isPresent()) {
                total = total.add(paymentOpt.get().getTotalAmount());
            }
        }

        return total;
    }
}

