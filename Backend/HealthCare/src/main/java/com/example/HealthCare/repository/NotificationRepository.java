package com.example.HealthCare.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    // Find all notifications ordered by created date
    List<Notification> findAllByOrderByCreatedAtDesc();
    
    // Find notifications by created by user
    List<Notification> findByCreatedByOrderByCreatedAtDesc(UUID createdBy);
    
    // Find notifications by type
    List<Notification> findByTypeOrderByCreatedAtDesc(String type);
}
