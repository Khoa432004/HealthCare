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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationUserRepository notificationUserRepository;
    private final UserAccountRepository userAccountRepository;

    @Override
    @Transactional
    public NotificationResponse createNotification(CreateNotificationRequest request, UUID adminId) {
        log.info("Creating notification: {}", request.getTitle());
        
        // Create notification
        Notification notification = Notification.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType())
                .targetRoles(request.getTargetRoles())
                .createdBy(adminId)
                .build();
        
        notification = notificationRepository.save(notification);
        log.info("Notification created with ID: {}", notification.getId());
        
        // Get target users based on roles
        List<UserAccount> targetUsers = getTargetUsers(request.getTargetRoles());
        log.info("Found {} target users for roles: {}", targetUsers.size(), request.getTargetRoles());
        
        // Create NotificationUser records for each target user
        for (UserAccount user : targetUsers) {
            NotificationUser notificationUser = NotificationUser.builder()
                    .notification(notification)
                    .user(user)
                    .isRead(false)
                    .build();
            notificationUserRepository.save(notificationUser);
        }
        
        log.info("Created {} notification-user records", targetUsers.size());
        
        return mapToResponse(notification);
    }

    @Override
    @Transactional
    public NotificationResponse updateNotification(UUID notificationId, UpdateNotificationRequest request) {
        log.info("Updating notification: {}", notificationId);
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        // Update notification fields
        notification.setTitle(request.getTitle());
        notification.setContent(request.getContent());
        notification.setType(request.getType());
        
        // Check if target roles changed
        boolean rolesChanged = hasRolesChanged(notification.getTargetRoles(), request.getTargetRoles());
        
        if (rolesChanged) {
            log.info("Target roles changed from {} to {}", notification.getTargetRoles(), request.getTargetRoles());
            
            // Delete old NotificationUser records
            notificationUserRepository.deleteByNotificationId(notificationId);
            
            // Update target roles
            notification.setTargetRoles(request.getTargetRoles());
            
            // Create new NotificationUser records
            List<UserAccount> targetUsers = getTargetUsers(request.getTargetRoles());
            for (UserAccount user : targetUsers) {
                NotificationUser notificationUser = NotificationUser.builder()
                        .notification(notification)
                        .user(user)
                        .isRead(false)
                        .build();
                notificationUserRepository.save(notificationUser);
            }
            
            log.info("Recreated {} notification-user records", targetUsers.size());
        }
        
        notification = notificationRepository.save(notification);
        log.info("Notification updated successfully");
        
        return mapToResponse(notification);
    }

    @Override
    @Transactional
    public void deleteNotification(UUID notificationId) {
        log.info("Deleting notification: {}", notificationId);
        
        // Delete NotificationUser records first (due to foreign key constraint)
        notificationUserRepository.deleteByNotificationId(notificationId);
        
        // Delete notification
        notificationRepository.deleteById(notificationId);
        
        log.info("Notification deleted successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getAllNotifications() {
        log.info("Getting all notifications");
        
        List<Notification> notifications = notificationRepository.findAllByOrderByCreatedAtDesc();
        
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(UUID notificationId) {
        log.info("Getting notification by ID: {}", notificationId);
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        return mapToResponse(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(UUID userId) {
        log.info("Getting notifications for user: {}", userId);
        
        List<NotificationUser> notificationUsers = notificationUserRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        return notificationUsers.stream()
                .map(this::mapToResponseWithUserData)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(UUID userId) {
        log.info("Getting unread notifications for user: {}", userId);
        
        List<NotificationUser> notificationUsers = notificationUserRepository.findUnreadByUserId(userId);
        
        return notificationUsers.stream()
                .map(this::mapToResponseWithUserData)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount(UUID userId) {
        log.info("Getting unread count for user: {}", userId);
        
        return notificationUserRepository.countUnreadByUserId(userId);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(UUID notificationUserId, UUID userId) {
        log.info("Marking notification as read: {} for user: {}", notificationUserId, userId);
        
        NotificationUser notificationUser = notificationUserRepository.findById(notificationUserId)
                .orElseThrow(() -> new RuntimeException("Notification user record not found"));
        
        // Verify that this notification belongs to the user
        if (!notificationUser.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: This notification does not belong to the user");
        }
        
        notificationUser.setIsRead(true);
        notificationUser.setReadAt(OffsetDateTime.now());
        notificationUserRepository.save(notificationUser);
        
        log.info("Notification marked as read successfully");
        
        return mapToResponseWithUserData(notificationUser);
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        
        List<NotificationUser> unreadNotifications = notificationUserRepository.findUnreadByUserId(userId);
        
        for (NotificationUser notificationUser : unreadNotifications) {
            notificationUser.setIsRead(true);
            notificationUser.setReadAt(OffsetDateTime.now());
            notificationUserRepository.save(notificationUser);
        }
        
        log.info("Marked {} notifications as read", unreadNotifications.size());
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
            // Send to all users (optimized: fetch all users directly instead of combining by roles)
            log.info("Target roles is null/empty/all three roles, fetching all users");
            return userAccountRepository.findAll().stream()
                    .filter(user -> !user.getIsDeleted())
                    .collect(Collectors.toList());
        }
        
        // Use Set to avoid duplicate users if they somehow match multiple roles
        Set<UserAccount> targetUsersSet = new HashSet<>();
        
        for (String roleStr : targetRoles) {
            try {
                UserRole role = UserRole.valueOf(roleStr);
                log.info("Fetching users with role: {}", role);
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
