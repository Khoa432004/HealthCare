package com.example.HealthCare.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.RefundRequest;
import com.example.HealthCare.dto.response.CanceledAppointmentResponse;
import com.example.HealthCare.dto.response.ResponseSuccess;
import com.example.HealthCare.service.CanceledAppointmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/admin/canceled-appointments")
@RequiredArgsConstructor
@Slf4j
public class CanceledAppointmentController {

    private final CanceledAppointmentService canceledAppointmentService;

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<ResponseSuccess> getCanceledAppointments(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<CanceledAppointmentResponse> appointments = 
                    canceledAppointmentService.getCanceledAppointments(search, pageable);
            
            return ResponseEntity.ok(new ResponseSuccess(
                    HttpStatus.OK,
                    "Canceled appointments retrieved successfully",
                    appointments
            ));
        } catch (Exception ex) {
            log.error("Error retrieving canceled appointments: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseSuccess(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to retrieve canceled appointments",
                            null
                    ));
        }
    }

    @PostMapping("/refund")
    @PreAuthorize("hasAuthority('PROCESS_REFUNDS')")
    public ResponseEntity<ResponseSuccess> processRefund(@Valid @RequestBody RefundRequest request) {
        try {
            canceledAppointmentService.processRefund(request);
            return ResponseEntity.ok(new ResponseSuccess(
                    HttpStatus.OK,
                    "Refund processed successfully",
                    null
            ));
        } catch (IllegalStateException ex) {
            log.error("Invalid refund request: {}", ex.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ResponseSuccess(
                            HttpStatus.BAD_REQUEST,
                            ex.getMessage(),
                            null
                    ));
        } catch (Exception ex) {
            log.error("Error processing refund: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseSuccess(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Failed to process refund",
                            null
                    ));
        }
    }
}

