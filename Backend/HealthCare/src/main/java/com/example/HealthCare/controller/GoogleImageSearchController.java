package com.example.HealthCare.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

/**
 * Proxy endpoint cho Google Custom Search Image API.
 * Key và CX được giữ trong backend .env, không lộ ra frontend.
 *
 * GET /api/drug-image?q={drugName}
 */
@RestController
@RequestMapping("/api/drug-image")
public class GoogleImageSearchController {

    @Value("${google.search.api.key:}")
    private String searchApiKey;

    @Value("${google.search.cx:}")
    private String searchCx;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> searchDrugImage(@RequestParam("q") String drugName) {
        if (searchApiKey == null || searchApiKey.isBlank()) {
            return ResponseEntity.status(503)
                    .body(objectMapper.valueToTree(
                            Map.of("error", "Google Search API key chưa được cấu hình.")));
        }
        if (searchCx == null || searchCx.isBlank()) {
            return ResponseEntity.status(503)
                    .body(objectMapper.valueToTree(
                            Map.of("error", "Google Search Engine ID (CX) chưa được cấu hình.")));
        }

        try {
            String encodedQuery = URLEncoder.encode(drugName, StandardCharsets.UTF_8);
            String url = "https://www.googleapis.com/customsearch/v1"
                    + "?key=" + searchApiKey
                    + "&cx=" + searchCx
                    + "&searchType=image"
                    + "&q=" + encodedQuery
                    + "&num=1";

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

            // Parse chuỗi JSON của Google thành JsonNode để tránh double-serialization
            // @RestController trả JsonNode → Spring serialize đúng raw JSON, không bị quote
            String body = resp.body();
            if (body == null || body.isBlank()) {
                return ResponseEntity.status(resp.statusCode())
                        .body(objectMapper.valueToTree(Map.of("error", "Google trả về body rỗng.")));
            }

            JsonNode jsonNode = objectMapper.readTree(body);
            return ResponseEntity.status(resp.statusCode()).body(jsonNode);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(objectMapper.valueToTree(
                            Map.of("error", "Lỗi gọi Google API: " + e.getMessage())));
        }
    }
}
