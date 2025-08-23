package com.example.HealthCare.model;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Account {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    // Professional information fields
    @Column(name = "title")
    private String title; // DOCTOR, etc.

    @Column(name = "current_province")
    private String currentProvince;

    @Column(name = "clinic_hospital")
    private String clinicHospital;

    // Medical care capabilities
    @Column(name = "care_for_adults")
    private Boolean careForAdults = false;

    @Column(name = "care_for_children")
    private Boolean careForChildren = false;

    // Specialties as comma-separated string or JSON
    @ElementCollection
    @CollectionTable(name = "account_specialties", joinColumns = @JoinColumn(name = "account_id"))
    @Column(name = "specialty")
    private List<String> specialties;

    // Treatment conditions
    @ElementCollection
    @CollectionTable(name = "account_treatment_conditions", joinColumns = @JoinColumn(name = "account_id"))
    @Column(name = "condition_name")
    private List<String> treatmentConditions;

    // Practicing certification
    @Column(name = "practicing_certification_id")
    private String practicingCertificationId;

    // Languages
    @ElementCollection
    @CollectionTable(name = "account_languages", joinColumns = @JoinColumn(name = "account_id"))
    @Column(name = "language")
    private List<String> languages;

    // Work experience
    @Column(name = "work_from_year")
    private Integer workFromYear;

    @Column(name = "work_to_year")
    private Integer workToYear;

    @Column(name = "work_clinic_hospital")
    private String workClinicHospital;

    @Column(name = "work_location")
    private String workLocation;

    @ElementCollection
    @CollectionTable(name = "account_work_specialties", joinColumns = @JoinColumn(name = "account_id"))
    @Column(name = "specialty")
    private List<String> workSpecialties;

    // Education
    @Column(name = "educational_institution")
    private String educationalInstitution;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "specialty_education")
    private String specialtyEducation;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
    
    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private User user;

    @Column(name = "reset_otp", length = 10)
    private String resetOtp;

    @Column(name = "reset_otp_expires_at")
    private Instant resetOtpExpiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;

    
    public Account(String email, String username, String password) {
        this.email = email;
        this.username = username;
        this.password = password;
    }
} 