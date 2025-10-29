package com.example.HealthCare.dto.request;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRequest {
	@NotNull(message = "User ID is required")
	private UUID id;
	
	private String fullName;
	
	private LocalDate dateOfBirth;
	
	// Gender as string (will be converted to enum)
	private String gender;
	
	@Email(message = "Email should be valid")
	private String email;
	
	// Role as string (admin/doctor/patient)
	private String role;
}
