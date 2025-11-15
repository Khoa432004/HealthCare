package com.example.HealthCare.dto.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfessionalInfoRequest {
    
    // Basic Information
    @NotBlank(message = "Title is required")
    private String title;
    
    private String province;
    
    @NotBlank(message = "Facility name is required")
    private String facilityName; // Clinic/Hospital of work
    
    // Medical Care
    @Builder.Default
    private boolean careForAdults = false;
    @Builder.Default
    private boolean careForChildren = false;
    
    // Multi-tag fields
    private List<String> specialties;
    private List<String> diseasesTreated;
    private List<String> languages;
    
    // Practicing Certification
    @NotBlank(message = "Practicing certification ID is required")
    private String practicingCertificationId;
    
    // Work Experience (optional - can be updated separately)
    private List<WorkExperienceRequest> workExperiences;
    
    // Education (optional - can be updated separately)
    private List<EducationRequest> educations;
    
    // Certification (optional - can be updated separately)
    private List<CertificationRequest> certifications;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkExperienceRequest {
        private UUID id; // If provided, update existing; if null, create new
        private String position;
        private List<String> specialties;
        private String clinicHospital;
        private String location;
        private String fromDate; // ISO date string
        private String toDate; // ISO date string, null for current job
        private Boolean isCurrentJob;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EducationRequest {
        private String specialty;
        private String qualification;
        private String school;
        private Integer fromYear;
        private Integer toYear;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificationRequest {
        private String name;
        private String issuingOrganization;
        private String issueDate; // ISO date string
        private String attachmentUrl;
    }
}

