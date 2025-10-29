package com.example.HealthCare.model;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "doctor_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@IdClass(DoctorProfileId.class)
public class DoctorProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "practice_license_no", nullable = false)
    private String practiceLicenseNo;

    @Column(name = "cccd_number", nullable = false)
    private String cccdNumber;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "workplace_name", nullable = false)
    private String workplaceName;

    @Column(name = "facility_name", nullable = false)
    private String facilityName;

    @Column(name = "clinic_address", nullable = false)
    private String clinicAddress;

    @Column(name = "care_target", nullable = false, columnDefinition = "TEXT[]")
    private String[] careTarget;

    @Column(name = "specialties", nullable = false, columnDefinition = "TEXT[]")
    private String[] specialties;

    @Column(name = "diseases_treated", nullable = false, columnDefinition = "TEXT[]")
    private String[] diseasesTreated;

    @Column(name = "education_summary", nullable = false)
    private String educationSummary;

    @Column(name = "training_institution", nullable = false)
    private String trainingInstitution;

    @Column(name = "graduation_year", nullable = false)
    private Integer graduationYear;

    @Column(name = "major", nullable = false)
    private String major;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "province")
    private String province;

    @Column(name = "consultation_fee")
    private BigDecimal consultationFee;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private UserAccount userAccount;
}
