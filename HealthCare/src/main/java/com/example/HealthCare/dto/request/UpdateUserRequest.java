package com.example.HealthCare.dto.request;

import com.example.HealthCare.enums.Gender;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRequest {
	@NotNull
	private Long id;
	private String fullName;
	private String dateOfBirth;
	private Gender gender;
	private String address;
	@Email
	private String email;
	private String role;
}
