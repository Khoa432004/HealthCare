package com.example.HealthCare.service;

import com.example.HealthCare.dto.request.DashboardFilterRequest;
import com.example.HealthCare.dto.response.DashboardStatsResponse;

public interface DashboardService {
    DashboardStatsResponse getDashboardStats(DashboardFilterRequest filter);
}

