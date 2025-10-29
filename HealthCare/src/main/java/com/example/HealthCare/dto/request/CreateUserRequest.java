package com.example.HealthCare.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateUserRequest {
	@NotBlank(message = "Email is required")
	@Email(message = "Email should be valid")
	private String email;
	
	@NotBlank(message = "Password is required")
	private String password;
	
	@NotBlank(message = "Full name is required")
	private String fullName;
	
	@NotBlank(message = "Phone is required")
	@Pattern(regexp = "^[0-9]{10,15}$", message = "Phone must be 10-15 digits")
	private String phone;
	
	// Gender as string (will be converted to enum)
	private String gender;
	
	// DateOfBirth as LocalDate
	private LocalDate dateOfBirth;
	
	// Role as string (admin/doctor/patient)
	private String role;
}
