package com.example.HealthCare.dto.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatPeerDto {
	private UUID id;
	private String fullName;
	private String gender;
	private Integer age;
	private String avatarUrl;
	/** Ví dụ ADMIN, DOCTOR — để client highlight (vd chat bệnh nhân ↔ admin). */
	private String role;
}
