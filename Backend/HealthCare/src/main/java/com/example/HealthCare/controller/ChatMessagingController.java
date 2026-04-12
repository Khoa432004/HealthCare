package com.example.HealthCare.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

import com.example.HealthCare.dto.request.GetChatMessagesRequest;
import com.example.HealthCare.dto.request.SendChatMessageRequest;
import com.example.HealthCare.dto.response.ChatMessageGroupDto;
import com.example.HealthCare.dto.response.ChatPeerDto;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.ChatMessagingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * User-to-user messaging (ysalus chat REST contract).
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
@Validated
public class ChatMessagingController {

	private final ChatMessagingService chatMessagingService;
	private final UserAccountRepository userAccountRepository;

	@PostMapping("/messages")
	public ResponseEntity<?> sendMessage(@Valid @RequestBody SendChatMessageRequest body) {
		try {
			UUID senderId = getCurrentUserId();
			UUID messageId = chatMessagingService.sendMessage(senderId, body);
			return ResponseEntity.ok(Map.of(
					"success", true,
					"message", "Message sent successfully",
					"data", Map.of("id", messageId.toString())));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
		} catch (Exception e) {
			log.error("sendMessage failed", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("success", false, "message", e.getMessage()));
		}
	}

	@PostMapping("/messages-group-by-date")
	public ResponseEntity<?> getMessagesGroupByDate(@Valid @RequestBody GetChatMessagesRequest body) {
		try {
			UUID senderId = getCurrentUserId();
			List<ChatMessageGroupDto> data = chatMessagingService.getMessagesGroupedByDate(senderId, body);
			return ResponseEntity.ok(Map.of(
					"success", true,
					"message", "Fetched successfully",
					"data", data));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
		} catch (Exception e) {
			log.error("getMessagesGroupByDate failed", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("success", false, "message", e.getMessage()));
		}
	}

	@GetMapping("/peers")
	public ResponseEntity<?> listPeers() {
		try {
			UUID userId = getCurrentUserId();
			List<ChatPeerDto> peers = chatMessagingService.listPeers(userId);
			return ResponseEntity.ok(Map.of("success", true, "message", "OK", "data", peers));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
		} catch (Exception e) {
			log.error("listPeers failed", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("success", false, "message", e.getMessage()));
		}
	}

	private UUID getCurrentUserId() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String email = authentication.getName();
		UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		return user.getId();
	}
}
