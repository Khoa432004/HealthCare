package com.example.HealthCare.repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.enums.PaymentStatus;
import com.example.HealthCare.model.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    
    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Payment p " +
           "WHERE p.status = :status AND p.paymentTime BETWEEN :fromDate AND :toDate")
    BigDecimal sumTotalAmountByStatusAndPaymentTimeBetween(
            @Param("status") PaymentStatus status,
            @Param("fromDate") OffsetDateTime fromDate,
            @Param("toDate") OffsetDateTime toDate
    );

    // UC-22: Sum revenue for a doctor's appointments in date range
    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Payment p " +
           "JOIN p.appointment a " +
           "WHERE a.doctorId = :doctorId " +
           "AND p.status = :status " +
           "AND DATE(p.paymentTime) = DATE(:date)")
    BigDecimal sumRevenueByDoctorIdAndDate(
            @Param("doctorId") java.util.UUID doctorId,
            @Param("status") PaymentStatus status,
            @Param("date") OffsetDateTime date
    );

    // UC-22: Sum revenue for a doctor's appointments in date range (general)
    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Payment p " +
           "JOIN p.appointment a " +
           "WHERE a.doctorId = :doctorId " +
           "AND p.status = :status " +
           "AND p.paymentTime >= :startDate " +
           "AND p.paymentTime <= :endDate")
    BigDecimal sumRevenueByDoctorIdAndDateRange(
            @Param("doctorId") java.util.UUID doctorId,
            @Param("status") PaymentStatus status,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate
    );
}

