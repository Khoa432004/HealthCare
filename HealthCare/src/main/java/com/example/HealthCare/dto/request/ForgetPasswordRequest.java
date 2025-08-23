package com.example.HealthCare.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgetPasswordRequest {
	@NotBlank
	private String username;
}
