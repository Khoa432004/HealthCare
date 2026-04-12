package com.example.HealthCare.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GetChatMessagesRequest {

	/** Ignored; current user is sender (JWT). */
	private String senderId;

	@NotBlank(message = "receiverId is required")
	private String receiverId;
}
