package com.example.HealthCare.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.HealthCare.dto.request.RefundRequest;
import com.example.HealthCare.dto.response.CanceledAppointmentResponse;

public interface CanceledAppointmentService {
    Page<CanceledAppointmentResponse> getCanceledAppointments(String search, Pageable pageable);
    void processRefund(RefundRequest request);
}

