package com.example.HealthCare.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.PayrollFilterRequest;
import com.example.HealthCare.dto.request.SettlePayrollRequest;
import com.example.HealthCare.dto.response.DoctorPayrollResponse;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.service.PayrollService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/admin/payroll")
@RequiredArgsConstructor
@Slf4j
public class PayrollController {

    private final PayrollService payrollService;

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_PAYROLL')")
    public ResponseEntity<ResponseSuccess> getDoctorPayrolls(
            @RequestParam Integer year,
            @RequestParam Integer month,
            @RequestParam(required = false) String search) {
        try {
            PayrollFilterRequest request = PayrollFilterRequest.builder()
                    .year(year)
                    .month(month)
                    .search(search)
                    .build();

            List<DoctorPayrollResponse> payrolls = payrollService.getDoctorPayrolls(request);

            return ResponseEntity.ok(new ResponseSuccess(
                    HttpStatus.OK,
                    "Doctor payrolls retrieved successfully",
                    payrolls
            ));
        } catch (Exception ex) {
            log.error("Error retrieving doctor payrolls: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseSuccess(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to retrieve doctor payrolls",
                            null
                    ));
        }
    }

    @PostMapping("/settle")
    @PreAuthorize("hasAuthority('SETTLE_PAYROLL')")
    public ResponseEntity<ResponseSuccess> settlePayroll(@Valid @RequestBody SettlePayrollRequest request) {
        try {
            payrollService.settlePayroll(request);
            return ResponseEntity.ok(new ResponseSuccess(
                    HttpStatus.OK,
                    "Payroll settled successfully",
                    null
            ));
        } catch (IllegalStateException ex) {
            log.error("Invalid settle payroll request: {}", ex.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ResponseSuccess(
                            HttpStatus.BAD_REQUEST,
                            ex.getMessage(),
                            null
                    ));
        } catch (Exception ex) {
            log.error("Error settling payroll: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseSuccess(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to settle payroll",
                            null
                    ));
        }
    }
}

