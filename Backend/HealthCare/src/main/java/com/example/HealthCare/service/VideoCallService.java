package com.example.HealthCare.service;

import java.util.UUID;

import com.example.HealthCare.dto.response.VideoCallJoinResponse;

public interface VideoCallService {

    VideoCallJoinResponse join(UUID appointmentId, UUID userId);

    void leave(UUID appointmentId, UUID userId);
}
