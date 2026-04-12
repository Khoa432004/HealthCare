package com.example.HealthCare.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "chat_threads", indexes = {
		@Index(name = "idx_chat_thread_first_user", columnList = "first_user_id"),
		@Index(name = "idx_chat_thread_second_user", columnList = "second_user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class ChatThread extends BaseEntity {

	@Column(name = "first_user_id", nullable = false)
	private UUID firstUserId;

	@Column(name = "second_user_id", nullable = false)
	private UUID secondUserId;

	@Column(name = "last_message_id")
	private UUID lastMessageId;
}
