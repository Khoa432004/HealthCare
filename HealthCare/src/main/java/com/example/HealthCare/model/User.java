package com.example.HealthCare.model;

import java.time.LocalDate;

import com.example.HealthCare.enums.Gender;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity {

	@Column(name = "full_name", nullable = false)
	private String fullName;

	@Column(nullable = false, unique = true, length = 15)
	private String phone;

	@Column(name = "identity_card", nullable = false, unique = true, length = 20)
	private String identityCard;

	@Column(name = "date_of_birth", nullable = false)
	private LocalDate dateOfBirth;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Gender gender;

	@Column(nullable = false)
	private String address;

	// Detailed address fields
	@Column(name = "country")
	private String country;

	@Column(name = "state_province")
	private String state;

	@Column(name = "city")
	private String city;

	@Column(name = "zip_code", length = 10)
	private String zipCode;

	@Column(name = "address_line_1")
	private String addressLine1;

	@Column(name = "address_line_2")
	private String addressLine2;

	@Column(nullable = false)
	private String department;

	@Column(name = "is_deleted", nullable = false)
	@lombok.Builder.Default
	private boolean isDeleted = false;

	@Column(name = "is_locked", nullable = false)
	@lombok.Builder.Default
	private boolean isLocked = false;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "created_by_user_id")
	private User createdBy;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "updated_by_user_id")
	private User updatedBy;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "account_id")
	private Account account;
}