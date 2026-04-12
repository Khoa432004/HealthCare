package com.example.HealthCare.model;

import java.util.UUID;

import com.example.HealthCare.enums.ChatMessageType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "chat_messages", indexes = {
		@Index(name = "idx_chat_message_chat_id", columnList = "chat_id"),
		@Index(name = "idx_chat_message_creator_id", columnList = "creator_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class ChatMessage extends BaseEntity {

	@Column(name = "chat_id", nullable = false)
	private UUID chatId;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 16)
	@lombok.Builder.Default
	private ChatMessageType type = ChatMessageType.TEXT;

	@Column(name = "creator_id", nullable = false)
	private UUID creatorId;
}
