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
}

