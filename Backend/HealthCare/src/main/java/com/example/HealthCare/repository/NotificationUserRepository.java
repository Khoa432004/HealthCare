package com.example.HealthCare.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.HealthCare.model.NotificationUser;

@Repository
public interface NotificationUserRepository extends JpaRepository<NotificationUser, UUID> {
    
    // Find all notifications for a specific user
    @Query("SELECT nu FROM NotificationUser nu JOIN FETCH nu.notification WHERE nu.user.id = :userId ORDER BY nu.createdAt DESC")
    List<NotificationUser> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);
    
    // Find unread notifications for a specific user
    @Query("SELECT nu FROM NotificationUser nu JOIN FETCH nu.notification WHERE nu.user.id = :userId AND nu.isRead = false ORDER BY nu.createdAt DESC")
    List<NotificationUser> findUnreadByUserId(@Param("userId") UUID userId);
    
    // Count unread notifications for a specific user
    @Query("SELECT COUNT(nu) FROM NotificationUser nu WHERE nu.user.id = :userId AND nu.isRead = false")
    Long countUnreadByUserId(@Param("userId") UUID userId);
    
    // Find notification user by notification id and user id
    @Query("SELECT nu FROM NotificationUser nu WHERE nu.notification.id = :notificationId AND nu.user.id = :userId")
    Optional<NotificationUser> findByNotificationIdAndUserId(@Param("notificationId") UUID notificationId, @Param("userId") UUID userId);
    
    // Find all notification users by notification id
    @Query("SELECT nu FROM NotificationUser nu JOIN FETCH nu.user WHERE nu.notification.id = :notificationId")
    List<NotificationUser> findByNotificationId(@Param("notificationId") UUID notificationId);
    
    // Delete all notification users by notification id
    void deleteByNotificationId(UUID notificationId);
}

