package com.example.HealthCare.dto.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessionalInfoRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
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
