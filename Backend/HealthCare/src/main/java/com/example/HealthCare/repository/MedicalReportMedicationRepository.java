package com.example.HealthCare.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.HealthCare.model.MedicalReportMedication;

public interface MedicalReportMedicationRepository extends JpaRepository<MedicalReportMedication, UUID> {
    List<MedicalReportMedication> findByMedicalReportId(UUID medicalReportId);
    
    void deleteByMedicalReportId(UUID medicalReportId);
}

