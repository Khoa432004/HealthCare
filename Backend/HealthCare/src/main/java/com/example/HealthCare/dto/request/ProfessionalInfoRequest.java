package com.example.HealthCare.dto.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessionalInfoRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    // Optional password - will be set during first login if not provided
    private String password;

    // Professional information
    @NotBlank(message = "Title is required")
    private String title; // DOCTOR, etc.

    private String currentProvince;

    @NotBlank(message = "Clinic/Hospital is required")
    private String clinicHospital;

    // Medical care for
    private boolean careForAdults = false;
    private boolean careForChildren = false;

    // Specialties
    private List<String> specialties;

    // Treatment conditions
    private List<String> treatmentConditions;

    // Practicing certification
    private String practicingCertificationId;
    
    // CCCD number from personal info
    private String cccdNumber;

    // Languages
    private List<String> languages;

    // Work experience
    private Integer workFromYear;
    private Integer workToYear;
    private String workClinicHospital;
    private String workLocation;
    private List<String> workSpecialties;

    // Education
    private String educationalInstitution;
    private Integer graduationYear;
    private String specialty;

    // Department for the system
    @NotBlank(message = "Department is required")
    private String department;
}
