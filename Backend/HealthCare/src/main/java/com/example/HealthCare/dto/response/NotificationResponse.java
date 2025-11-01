package com.example.HealthCare.dto.response;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private UUID id;
    private String title;
    private String content;
    private String type;
    private List<String> targetRoles; // ["DOCTOR", "PATIENT", "ADMIN"] or null for all
    private UUID createdBy;
    private String createdByName;
    private OffsetDateTime createdAt;
    
    // For user-specific notifications
    private Boolean isRead;
    private OffsetDateTime readAt;
    private UUID notificationUserId; // ID of the NotificationUser record
}
