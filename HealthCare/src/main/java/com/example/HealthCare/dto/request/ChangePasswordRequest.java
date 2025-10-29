package com.example.HealthCare.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordRequest {
	@NotBlank(message = "Email is required")
	@Email(message = "Email should be valid")
	private String email;
	
	@NotBlank(message = "Old password is required")
	private String oldPassword;
	
	@NotBlank(message = "New password is required")
	private String newPassword;
}
