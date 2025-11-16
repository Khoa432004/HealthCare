package com.example.HealthCare.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.HealthCare.model.MedicalReport;

public interface MedicalReportRepository extends JpaRepository<MedicalReport, UUID>{
    Optional<MedicalReport> findByAppointmentId(UUID appointmentId);
}
