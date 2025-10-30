package com.example.HealthCare.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.enums.RequestStatus;
import com.example.HealthCare.model.ApprovalRequest;

@Repository
public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, UUID> {
    Optional<ApprovalRequest> findByUserId(UUID userId);
    Long countByStatus(RequestStatus status);
}

