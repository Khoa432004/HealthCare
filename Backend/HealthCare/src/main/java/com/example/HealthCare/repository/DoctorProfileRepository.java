package com.example.HealthCare.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.model.DoctorProfile;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, UUID> {
    Optional<DoctorProfile> findByUserId(UUID userId);
    
    Optional<DoctorProfile> findByPracticeLicenseNo(String practiceLicenseNo);
    
    boolean existsByPracticeLicenseNo(String practiceLicenseNo);
    
    @Query("SELECT COUNT(d) > 0 FROM DoctorProfile d WHERE d.practiceLicenseNo = :practiceLicenseNo AND d.userId != :userId")
    boolean existsByPracticeLicenseNoAndUserIdNot(String practiceLicenseNo, UUID userId);


    // Tìm bác sĩ theo tên hoặc chuyên môn (case-insensitive)
    @Query("SELECT d FROM DoctorProfile d WHERE " +
           "LOWER(d.userAccount.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.specialties) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<DoctorProfile> searchByNameOrSpecialty(String query);


    // Lấy tất cả bác sĩ 
    List<DoctorProfile> findAll();
}

