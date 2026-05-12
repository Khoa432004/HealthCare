package com.example.HealthCare.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.HealthCare.model.DoctorExamPackage;

public interface DoctorExamPackageRepository extends JpaRepository<DoctorExamPackage, UUID> {

	List<DoctorExamPackage> findByDoctorUserIdOrderBySortOrderAsc(UUID doctorUserId);

	@Modifying
	@Query("DELETE FROM DoctorExamPackage d WHERE d.doctorUserId = :doctorUserId")
	void deleteByDoctorUserId(@Param("doctorUserId") UUID doctorUserId);
}
