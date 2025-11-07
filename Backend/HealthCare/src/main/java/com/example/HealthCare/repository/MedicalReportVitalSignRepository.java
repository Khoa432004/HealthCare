package com.example.HealthCare.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.HealthCare.model.MedicalReportVitalSign;

public interface MedicalReportVitalSignRepository extends JpaRepository<MedicalReportVitalSign, UUID> {
    List<MedicalReportVitalSign> findByMedicalReportId(UUID medicalReportId);
}
