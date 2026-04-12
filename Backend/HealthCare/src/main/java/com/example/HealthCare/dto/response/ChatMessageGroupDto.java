package com.example.HealthCare.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageGroupDto {
	private String date;
	private List<ChatMessageItemDto> messages;
}
