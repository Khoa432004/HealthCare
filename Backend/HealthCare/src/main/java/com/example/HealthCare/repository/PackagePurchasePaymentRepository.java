package com.example.HealthCare.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.model.PackagePurchasePayment;

@Repository
public interface PackagePurchasePaymentRepository extends JpaRepository<PackagePurchasePayment, UUID> {
    PackagePurchasePayment findByPackagePurchaseId(UUID packagePurchaseId);
}
