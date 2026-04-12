package com.example.HealthCare.service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatRealtimeService {

	private final SimpMessagingTemplate messagingTemplate;

	/**
	 * Same payload shape as ysalus Socket.IO {@code receive_message}.
	 */
	public void broadcastChatMessage(UUID senderId, UUID receiverId, UUID messageId, String content, String type) {
		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("id", messageId.toString());
		payload.put("senderId", senderId.toString());
		payload.put("receiverId", receiverId.toString());
		payload.put("content", content);
		payload.put("type", type);

		try {
			messagingTemplate.convertAndSend("/topic/chat/" + receiverId, payload);
			messagingTemplate.convertAndSend("/topic/chat/" + senderId, payload);
		} catch (Exception e) {
			log.warn("Failed to broadcast chat message: {}", e.getMessage());
		}
	}
}
