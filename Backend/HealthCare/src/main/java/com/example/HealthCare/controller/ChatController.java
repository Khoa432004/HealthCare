package com.example.HealthCare.controller;

import com.example.HealthCare.service.GoogleGenerativeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    private final GoogleGenerativeService generativeService;

    public ChatController(GoogleGenerativeService generativeService) {
        this.generativeService = generativeService;
    }

    public static record ChatRequest(String message) {}

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
