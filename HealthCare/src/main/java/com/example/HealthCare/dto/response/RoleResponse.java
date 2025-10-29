package com.example.HealthCare.dto.response;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

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
	private UUID id;
	private String name;
	private String description;
	private List<Privilege> privileges;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;
}
