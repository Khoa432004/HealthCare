package com.example.HealthCare.service;

import java.util.UUID;

import com.example.HealthCare.dto.response.PatientDashboardOverviewResponse;

public interface PatientDashboardService {
    PatientDashboardOverviewResponse getOverview(UUID patientId);
}
