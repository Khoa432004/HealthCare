package com.example.HealthCare.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.model.PatientExamPackagePurchase;

@Repository
public interface PatientExamPackagePurchaseRepository extends JpaRepository<PatientExamPackagePurchase, UUID> {
    List<PatientExamPackagePurchase> findByPatientIdOrderByPurchaseDateDesc(UUID patientId);
    List<PatientExamPackagePurchase> findByDoctorId(UUID doctorId);
    List<PatientExamPackagePurchase> findByPatientIdAndStatus(UUID patientId, String status);
}
