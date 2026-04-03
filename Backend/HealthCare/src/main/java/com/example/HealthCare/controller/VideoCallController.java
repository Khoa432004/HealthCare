package com.example.HealthCare.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.HealthCare.dto.request.VideoCallAppointmentRequest;
import com.example.HealthCare.dto.response.VideoCallJoinResponse;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.service.VideoCallService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/video-calls")
@RequiredArgsConstructor
@Slf4j
public class VideoCallController {

    private final VideoCallService videoCallService;
    private final UserAccountRepository userAccountRepository;

    @PostMapping("/join")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> join(@Valid @RequestBody VideoCallAppointmentRequest request) {
        try {
            UUID userId = getCurrentUserId();
            VideoCallJoinResponse data = videoCallService.join(request.getAppointmentId(), userId);
            return ResponseEntity.ok(Map.of("success", true, "data", data));
        } catch (com.example.HealthCare.exception.NotFoundException e) {
            log.warn("Video join not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "not_found", "message", e.getMessage()));
        } catch (com.example.HealthCare.exception.BadRequestException e) {
            log.warn("Video join bad request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "bad_request", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Video join error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/leave")
    @PreAuthorize("hasAuthority('VIEW_APPOINTMENTS')")
    public ResponseEntity<?> leave(@Valid @RequestBody VideoCallAppointmentRequest request) {
        try {
            UUID userId = getCurrentUserId();
            videoCallService.leave(request.getAppointmentId(), userId);
            return ResponseEntity.ok(Map.of("success", true, "data", true));
        } catch (com.example.HealthCare.exception.NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "not_found", "message", e.getMessage()));
        } catch (com.example.HealthCare.exception.BadRequestException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "bad_request", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Video leave error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getId();
    }
}
