package com.example.HealthCare.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.HealthCare.enums.Gender;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
	private Long id;
	private String username;
	private String fullName;
	private String email;
	private String phone;
	private String identityCard;
	private LocalDate dateOfBirth;
	private Gender gender;
	private String address;
	private String department;
	private String roleName;
	private boolean isDeleted;
	private boolean isLocked;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
