package com.example.HealthCare.service.impl;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.CreateNotificationRequest;
import com.example.HealthCare.dto.request.UpdateNotificationRequest;
import com.example.HealthCare.dto.response.NotificationResponse;
import com.example.HealthCare.enums.UserRole;
import com.example.HealthCare.model.Notification;
import com.example.HealthCare.model.NotificationUser;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.NotificationRepository;
import com.example.HealthCare.repository.NotificationUserRepository;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.NotificationService;
import com.example.HealthCare.websocket.NotificationWebSocketService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationUserRepository notificationUserRepository;
    private final UserAccountRepository userAccountRepository;
    private final NotificationWebSocketService webSocketService;

    @Override
    @Transactional
    public NotificationResponse createNotification(CreateNotificationRequest request, UUID adminId) {
        Notification notification = Notification.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType())
                .targetRoles(request.getTargetRoles())
                .createdBy(adminId)
                .build();
        
        notification = notificationRepository.save(notification);
        List<UserAccount> targetUsers = getTargetUsers(request.getTargetRoles());
        
        List<NotificationUser> notificationUsers = new ArrayList<>();
        for (UserAccount user : targetUsers) {
            NotificationUser notificationUser = NotificationUser.builder()
                    .notification(notification)
                    .user(user)
                    .isRead(false)
                    .build();
            notificationUser = notificationUserRepository.save(notificationUser);
            notificationUsers.add(notificationUser);
        }
        
        for (NotificationUser notificationUser : notificationUsers) {
            try {
                NotificationResponse userResponse = mapToResponseWithUserData(notificationUser);
                webSocketService.sendNotificationToUser(notificationUser.getUser().getId(), userResponse);
                Long unreadCount = notificationUserRepository.countUnreadByUserId(notificationUser.getUser().getId());
                webSocketService.sendUnreadCountToUser(notificationUser.getUser().getId(), unreadCount);
            } catch (Exception e) {
                log.error("Error broadcasting notification via WebSocket to user {}: {}", 
                    notificationUser.getUser().getId(), e.getMessage());
            }
        }
        
        return mapToResponse(notification);
    }

    @Override
    @Transactional
    public NotificationResponse updateNotification(UUID notificationId, UpdateNotificationRequest request) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setTitle(request.getTitle());
        notification.setContent(request.getContent());
        notification.setType(request.getType());
        
        boolean rolesChanged = hasRolesChanged(notification.getTargetRoles(), request.getTargetRoles());
        
        if (rolesChanged) {
            notificationUserRepository.deleteByNotificationId(notificationId);
            notification.setTargetRoles(request.getTargetRoles());
            
            List<UserAccount> targetUsers = getTargetUsers(request.getTargetRoles());
            for (UserAccount user : targetUsers) {
                NotificationUser notificationUser = NotificationUser.builder()
                        .notification(notification)
                        .user(user)
                        .isRead(false)
                        .build();
                notificationUserRepository.save(notificationUser);
            }
            
        }
        
        notification = notificationRepository.save(notification);
        return mapToResponse(notification);
    }

    @Override
    @Transactional
    public void deleteNotification(UUID notificationId) {
        notificationUserRepository.deleteByNotificationId(notificationId);
        notificationRepository.deleteById(notificationId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getAllNotifications() {
        List<Notification> notifications = notificationRepository.findAllByOrderByCreatedAtDesc();
        
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        return mapToResponse(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(UUID userId) {
        List<NotificationUser> notificationUsers = notificationUserRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        return notificationUsers.stream()
                .map(this::mapToResponseWithUserData)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(UUID userId) {
        List<NotificationUser> notificationUsers = notificationUserRepository.findUnreadByUserId(userId);
        
        return notificationUsers.stream()
                .map(this::mapToResponseWithUserData)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount(UUID userId) {
        
        return notificationUserRepository.countUnreadByUserId(userId);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(UUID notificationUserId, UUID userId) {
        NotificationUser notificationUser = notificationUserRepository.findById(notificationUserId)
                .orElseThrow(() -> new RuntimeException("Notification user record not found"));
        
        if (!notificationUser.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: This notification does not belong to the user");
        }
        
        notificationUser.setIsRead(true);
        notificationUser.setReadAt(OffsetDateTime.now());
        notificationUserRepository.save(notificationUser);
        
        try {
            Long unreadCount = notificationUserRepository.countUnreadByUserId(userId);
            webSocketService.sendUnreadCountToUser(userId, unreadCount);
        } catch (Exception e) {
            log.error("Error sending updated unread count via WebSocket: {}", e.getMessage());
        }
        
        return mapToResponseWithUserData(notificationUser);
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        List<NotificationUser> unreadNotifications = notificationUserRepository.findUnreadByUserId(userId);
        
        for (NotificationUser notificationUser : unreadNotifications) {
            notificationUser.setIsRead(true);
            notificationUser.setReadAt(OffsetDateTime.now());
            notificationUserRepository.save(notificationUser);
        }
        
        try {
            Long unreadCount = notificationUserRepository.countUnreadByUserId(userId);
            webSocketService.sendUnreadCountToUser(userId, unreadCount);
        } catch (Exception e) {
            log.error("Error sending updated unread count via WebSocket: {}", e.getMessage());
        }
    }

    // Helper methods
    
    private List<UserAccount> getTargetUsers(List<String> targetRoles) {
        // Check if null, empty, or has all 3 roles (DOCTOR, PATIENT, ADMIN) = send to all users
        // When "Send to all users" is selected in UI, targetRoles = ["DOCTOR", "PATIENT", "ADMIN"]
        boolean hasAllRoles = targetRoles != null && 
                              targetRoles.size() == 3 &&
                              targetRoles.contains("DOCTOR") &&
                              targetRoles.contains("PATIENT") &&
                              targetRoles.contains("ADMIN");
        
        if (targetRoles == null || targetRoles.isEmpty() || hasAllRoles) {
            return userAccountRepository.findAll().stream()
                    .filter(user -> !user.getIsDeleted())
                    .collect(Collectors.toList());
        }
        
        Set<UserAccount> targetUsersSet = new HashSet<>();
        
        for (String roleStr : targetRoles) {
            try {
                UserRole role = UserRole.valueOf(roleStr);
                List<UserAccount> usersWithRole = userAccountRepository.findAllByRoleAndIsDeletedFalse(role);
                targetUsersSet.addAll(usersWithRole);
            } catch (IllegalArgumentException e) {
                log.error("Invalid role: {}", roleStr);
                throw new RuntimeException("Invalid target role: " + roleStr);
            }
        }
        
        return new ArrayList<>(targetUsersSet);
    }
    
    private boolean hasRolesChanged(List<String> oldRoles, List<String> newRoles) {
        // Both null or empty = no change
        if ((oldRoles == null || oldRoles.isEmpty()) && (newRoles == null || newRoles.isEmpty())) {
            return false;
        }
        
        // One null/empty, other not = changed
        if ((oldRoles == null || oldRoles.isEmpty()) != (newRoles == null || newRoles.isEmpty())) {
            return true;
        }
        
        // Compare contents (at this point both are non-null and non-empty)
        if (oldRoles != null && newRoles != null && oldRoles.size() != newRoles.size()) {
            return true;
        }
        
        if (oldRoles == null || newRoles == null) {
            return false; // Should not reach here based on previous checks
        }
        
        Set<String> oldSet = new HashSet<>(oldRoles);
        Set<String> newSet = new HashSet<>(newRoles);
        
        return !oldSet.equals(newSet);
    }
    
    private NotificationResponse mapToResponse(Notification notification) {
        // Get creator name
        String creatorName = userAccountRepository.findById(notification.getCreatedBy())
                .map(UserAccount::getFullName)
                .orElse("Unknown");
        
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .type(notification.getType())
                .targetRoles(notification.getTargetRoles())
                .createdBy(notification.getCreatedBy())
                .createdByName(creatorName)
                .createdAt(notification.getCreatedAt())
                .build();
    }
    
    private NotificationResponse mapToResponseWithUserData(NotificationUser notificationUser) {
        Notification notification = notificationUser.getNotification();
        
        // Get creator name
        String creatorName = userAccountRepository.findById(notification.getCreatedBy())
                .map(UserAccount::getFullName)
                .orElse("Unknown");
        
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .type(notification.getType())
                .targetRoles(notification.getTargetRoles())
                .createdBy(notification.getCreatedBy())
                .createdByName(creatorName)
                .createdAt(notification.getCreatedAt())
                .isRead(notificationUser.getIsRead())
                .readAt(notificationUser.getReadAt())
                .notificationUserId(notificationUser.getId())
                .build();
    }
}
