package com.example.HealthCare.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import com.example.HealthCare.converter.AccountStatusConverter;
import com.example.HealthCare.converter.GenderConverter;
import com.example.HealthCare.converter.UserRoleConverter;
import com.example.HealthCare.enums.AccountStatus;
import com.example.HealthCare.enums.Gender;
import com.example.HealthCare.enums.UserRole;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "user_account")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class UserAccount extends BaseEntity {

    @Convert(converter = UserRoleConverter.class)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @Convert(converter = AccountStatusConverter.class)
    @Column(name = "status", nullable = false)
    @lombok.Builder.Default
    private AccountStatus status = AccountStatus.PENDING;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Convert(converter = GenderConverter.class)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "first_login_required", nullable = false)
    @lombok.Builder.Default
    private Boolean firstLoginRequired = false;

    @Column(name = "term_accepted_at")
    private OffsetDateTime termAcceptedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserAccount createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private UserAccount updatedBy;

    @Column(name = "is_deleted", nullable = false)
    @lombok.Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @OneToOne(mappedBy = "userAccount", fetch = FetchType.LAZY)
    private DoctorProfile doctorProfile;
}
