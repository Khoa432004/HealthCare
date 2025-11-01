package com.example.HealthCare.dto.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNotificationRequest {
    private String title;
    private String content;
    private String type;
    private List<String> targetRoles; // ["DOCTOR", "PATIENT", "ADMIN"] or null/empty for all users
}
