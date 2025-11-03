package com.example.HealthCare.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.model.DoctorExperience;

@Repository
public interface DoctorExperienceRepository extends JpaRepository<DoctorExperience, UUID> {
    List<DoctorExperience> findByDoctorId(UUID doctorId);
    void deleteByDoctorId(UUID doctorId);
}

