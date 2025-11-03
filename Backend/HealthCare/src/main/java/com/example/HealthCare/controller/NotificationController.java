package com.example.HealthCare.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.CreateNotificationRequest;
import com.example.HealthCare.dto.request.UpdateNotificationRequest;
import com.example.HealthCare.dto.response.NotificationResponse;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final UserAccountRepository userAccountRepository;

    // ========== ADMIN OPERATIONS ==========
    
    @GetMapping
    @PreAuthorize("hasAuthority('MANAGE_NOTIFICATIONS')")
    public ResponseEntity<?> getAllNotifications() {
        try {
            List<NotificationResponse> notifications = notificationService.getAllNotifications();
            return ResponseEntity.ok(Map.of("success", true, "data", notifications));
        } catch (Exception e) {
            log.error("Error getting notifications", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_NOTIFICATIONS')")
    public ResponseEntity<?> getNotificationById(@PathVariable UUID id) {
        try {
            NotificationResponse notification = notificationService.getNotificationById(id);
            return ResponseEntity.ok(Map.of("success", true, "data", notification));
        } catch (Exception e) {
            log.error("Error getting notification", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_NOTIFICATIONS')")
    public ResponseEntity<?> createNotification(@RequestBody CreateNotificationRequest request) {
        try {
            // Get current admin user by email
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            UserAccount admin = userAccountRepository.findByEmailAndIsDeletedFalse(email)
                    .orElseThrow(() -> new RuntimeException("Admin user not found"));
            
            UUID adminId = admin.getId();
            NotificationResponse notification = notificationService.createNotification(request, adminId);
            return ResponseEntity.ok(Map.of("success", true, "data", notification));
        } catch (Exception e) {
            log.error("Error creating notification", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_NOTIFICATIONS')")
    public ResponseEntity<?> updateNotification(@PathVariable UUID id, @RequestBody UpdateNotificationRequest request) {
        try {
            NotificationResponse notification = notificationService.updateNotification(id, request);
            return ResponseEntity.ok(Map.of("success", true, "data", notification));
        } catch (Exception e) {
            log.error("Error updating notification", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_NOTIFICATIONS')")
    public ResponseEntity<?> deleteNotification(@PathVariable UUID id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Notification deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting notification", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ========== USER OPERATIONS ==========
    
    @GetMapping("/my-notifications")
    public ResponseEntity<?> getMyNotifications() {
        try {
            UUID userId = getCurrentUserId();
            List<NotificationResponse> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(Map.of("success", true, "data", notifications));
        } catch (Exception e) {
            log.error("Error getting user notifications", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping("/my-notifications/unread")
    public ResponseEntity<?> getMyUnreadNotifications() {
        try {
            UUID userId = getCurrentUserId();
            List<NotificationResponse> notifications = notificationService.getUnreadNotifications(userId);
            return ResponseEntity.ok(Map.of("success", true, "data", notifications));
        } catch (Exception e) {
            log.error("Error getting unread notifications", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping("/my-notifications/unread/count")
    public ResponseEntity<?> getUnreadCount() {
        try {
            UUID userId = getCurrentUserId();
            Long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(Map.of("success", true, "count", count));
        } catch (Exception e) {
            log.error("Error getting unread count", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @PutMapping("/my-notifications/{notificationUserId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable UUID notificationUserId) {
        try {
            UUID userId = getCurrentUserId();
            NotificationResponse notification = notificationService.markAsRead(notificationUserId, userId);
            return ResponseEntity.ok(Map.of("success", true, "data", notification));
        } catch (Exception e) {
            log.error("Error marking notification as read", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @PutMapping("/my-notifications/read-all")
    public ResponseEntity<?> markAllAsRead() {
        try {
            UUID userId = getCurrentUserId();
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "All notifications marked as read"));
        } catch (Exception e) {
            log.error("Error marking all notifications as read", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    // ========== HELPER METHODS ==========
    
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return user.getId();
    }
}
