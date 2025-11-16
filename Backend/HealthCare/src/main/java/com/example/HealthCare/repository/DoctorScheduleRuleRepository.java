package com.example.HealthCare.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.model.DoctorScheduleRule;

@Repository
public interface DoctorScheduleRuleRepository extends JpaRepository<DoctorScheduleRule, UUID> {
    
    @Query("SELECT r FROM DoctorScheduleRule r WHERE r.doctorId = :doctorId ORDER BY r.weekday ASC, r.startTime ASC")
    List<DoctorScheduleRule> findByDoctorIdOrderByWeekdayAscStartTimeAsc(@Param("doctorId") UUID doctorId);
    
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM DoctorScheduleRule r WHERE r.doctorId = :doctorId")
    void deleteByDoctorId(@Param("doctorId") UUID doctorId);
    
    // UC-22: Get average appointment cost for a doctor (or default if no rules exist)
    @Query("SELECT COALESCE(AVG(r.appointmentCost), 150000) FROM DoctorScheduleRule r WHERE r.doctorId = :doctorId")
    BigDecimal getAverageAppointmentCostByDoctorId(@Param("doctorId") UUID doctorId);
}

