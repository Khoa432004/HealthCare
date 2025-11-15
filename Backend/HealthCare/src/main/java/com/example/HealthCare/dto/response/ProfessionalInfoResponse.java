package com.example.HealthCare.dto.response;

import java.time.LocalDate;
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
public class ProfessionalInfoResponse {
    
    // Basic Information
    private String title;
    private String province;
    private String facilityName;
    
    // Medical Care
    private List<String> careTarget; // ["Adults", "Children"] or ["Người lớn", "Trẻ em"]
    
    // Multi-tag fields
    private List<String> specialties;
    private List<String> diseasesTreated;
    private List<String> languages;
    
    // Practicing Certification
    private String practicingCertificationId;
    
    // Work Experience (multiple entries)
    private List<WorkExperienceDto> workExperiences;
    
    // Education (multiple entries - currently single from doctor_profile)
    private List<EducationDto> educations;
    
    // Certification (multiple entries - currently using practice_license_no)
    private List<CertificationDto> certifications;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkExperienceDto {
        private UUID id;
        private String position; // specialty field
        private List<String> specialties; // specialty field as list
        private String clinicHospital; // organization field
        private String location; // location field
        private LocalDate fromDate;
        private LocalDate toDate;
        private Boolean isCurrentJob; // true if toDate is null or in future
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EducationDto {
        private String specialty; // major field
        private String qualification; // education_summary field
        private String school; // training_institution field
        private Integer fromYear; // graduation_year - 4 (assumed 4-year program)
        private Integer toYear; // graduation_year
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificationDto {
        private String name; // certification name
        private String issuingOrganization; // issuing authority
        private LocalDate issueDate; // date of issue
        private String attachmentUrl; // file attachment if any
    }
}

