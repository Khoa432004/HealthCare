package com.example.HealthCare.dto.request;

import com.example.HealthCare.enums.Gender;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateUserRequest {
	@NotBlank
	private String username;
	@NotBlank
	private String password;
	@NotBlank
	private String fullName;
	@Email
	@NotBlank
	private String email;
	@NotBlank
	@Pattern(regexp = "^[0-9]{10,15}$")
	private String phone;
	@NotBlank
	@Pattern(regexp = "^[0-9]{9,12}$")
	private String identityCard;
	@NotBlank
	private String dateOfBirth;
	@NotNull
	private Gender gender;
	@NotBlank
	private String address;
	@NotBlank
	private String department;
	@NotBlank
	private String role;
}
