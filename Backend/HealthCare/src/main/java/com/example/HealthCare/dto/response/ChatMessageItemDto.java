package com.example.HealthCare.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageItemDto {
	private UUID id;
	private String content;
	private String type;
	private ChatUserBriefDto creator;
	private OffsetDateTime createdAt;
}
