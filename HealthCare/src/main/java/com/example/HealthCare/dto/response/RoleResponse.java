package com.example.HealthCare.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.example.HealthCare.enums.Privilege;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponse {
	private Long id;
	private String name;
	private String description;
	private List<Privilege> privileges;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
