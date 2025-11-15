package com.example.HealthCare.service;

import java.util.UUID;

import com.example.HealthCare.dto.request.UpdateWorkScheduleRequest;
import com.example.HealthCare.dto.response.WorkScheduleResponse;

public interface DoctorScheduleService {
    WorkScheduleResponse getWorkSchedule(UUID doctorId);
    WorkScheduleResponse updateWorkSchedule(UUID doctorId, UpdateWorkScheduleRequest request);
}

