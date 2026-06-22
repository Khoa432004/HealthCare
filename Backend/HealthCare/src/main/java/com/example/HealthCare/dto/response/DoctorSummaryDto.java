package com.example.HealthCare.dto.response;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Data;

@Data
public class DoctorSummaryDto {
    private UUID id;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String role;
    private String status;
    private String fullName;
    private String gender;
    private LocalDate dateOfBirth;
    private String email;
    private String phoneNumber;
    private DoctorProfileDto doctorProfile;
}
