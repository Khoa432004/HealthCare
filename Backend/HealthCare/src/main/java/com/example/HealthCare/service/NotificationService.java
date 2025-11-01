package com.example.HealthCare.service;

import java.util.List;
import java.util.UUID;

import com.example.HealthCare.dto.request.CreateNotificationRequest;
import com.example.HealthCare.dto.request.UpdateNotificationRequest;
import com.example.HealthCare.dto.response.NotificationResponse;

public interface NotificationService {
    
    // Admin operations - manage notifications
    NotificationResponse createNotification(CreateNotificationRequest request, UUID adminId);
    NotificationResponse updateNotification(UUID notificationId, UpdateNotificationRequest request);
    void deleteNotification(UUID notificationId);
    List<NotificationResponse> getAllNotifications();
    NotificationResponse getNotificationById(UUID notificationId);
    
    // User operations - read notifications
    List<NotificationResponse> getUserNotifications(UUID userId);
    List<NotificationResponse> getUnreadNotifications(UUID userId);
    Long getUnreadCount(UUID userId);
    NotificationResponse markAsRead(UUID notificationUserId, UUID userId);
    void markAllAsRead(UUID userId);
}
