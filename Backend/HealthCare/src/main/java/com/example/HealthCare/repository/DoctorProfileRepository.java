package com.example.HealthCare.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.model.DoctorProfile;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, UUID> {
    Optional<DoctorProfile> findByUserId(UUID userId);
    
    Optional<DoctorProfile> findByPracticeLicenseNo(String practiceLicenseNo);
    
    boolean existsByPracticeLicenseNo(String practiceLicenseNo);
}

