package com.example.HealthCare.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendChatMessageRequest {

	/** Ignored server-side; sender is taken from JWT (ysalus gateway behaviour). */
	private String senderId;

	@NotBlank(message = "receiverId is required")
	private String receiverId;

	@NotBlank(message = "content is required")
	private String content;

	/** Optional: text | image | video | mix */
	private String type;
}
