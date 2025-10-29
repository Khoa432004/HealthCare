package com.example.HealthCare.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgetPasswordRequest {
	@NotBlank(message = "Email is required")
	@Email(message = "Email should be valid")
	private String email;
}
