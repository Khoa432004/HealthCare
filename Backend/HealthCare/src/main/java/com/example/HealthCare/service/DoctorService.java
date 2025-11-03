package com.example.HealthCare.service;

import java.util.List;
import java.util.UUID;

import com.example.HealthCare.dto.DoctorDetailDto;
import com.example.HealthCare.dto.DoctorSummaryDto;

public interface DoctorService {
    List<DoctorSummaryDto> getAllDoctors(String searchQuery);
    DoctorDetailDto getDoctorDetail(UUID doctorId);
}
