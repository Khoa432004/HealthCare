package com.example.HealthCare.service;

import java.util.List;

import com.example.HealthCare.dto.request.PayrollFilterRequest;
import com.example.HealthCare.dto.request.SettlePayrollRequest;
import com.example.HealthCare.dto.response.DoctorPayrollResponse;

public interface PayrollService {
    List<DoctorPayrollResponse> getDoctorPayrolls(PayrollFilterRequest request);
    void settlePayroll(SettlePayrollRequest request);
}

