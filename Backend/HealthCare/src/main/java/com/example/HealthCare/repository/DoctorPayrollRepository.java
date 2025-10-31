package com.example.HealthCare.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.model.DoctorPayroll;

@Repository
public interface DoctorPayrollRepository extends JpaRepository<DoctorPayroll, UUID> {
    Optional<DoctorPayroll> findByDoctorIdAndPeriodYearAndPeriodMonth(UUID doctorId, Integer year, Integer month);
}

