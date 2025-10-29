package com.example.HealthCare.dto.request;

import java.util.List;

import com.example.HealthCare.enums.Privilege;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateRoleRequest {
	@NotBlank
	private String name;
	private String description;
	@NotNull
	private List<Privilege> privileges;
}
