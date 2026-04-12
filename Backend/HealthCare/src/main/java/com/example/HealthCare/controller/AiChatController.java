package com.example.HealthCare.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.service.GoogleGenerativeService;

import lombok.RequiredArgsConstructor;

/**
 * Gemini / AI assistant chat (formerly {@code POST /api/chat}).
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiChatController {

	private final GoogleGenerativeService generativeService;

	public static record ChatRequest(String message) {
	}

	@PostMapping("/chat")
	public ResponseEntity<?> chat(@RequestBody ChatRequest req) {
		try {
			String resp = generativeService.generateText(req.message());
			return ResponseEntity.ok(Map.of("response", resp));
		} catch (IllegalStateException e) {
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(500).body(Map.of("error", "internal error", "detail", e.getMessage()));
		}
	}
}
