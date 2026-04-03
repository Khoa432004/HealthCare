package com.example.HealthCare.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoCallJoinResponse {
    private UUID appointmentId;
    private String channel;
    /** Agora user account — use as `uid` when calling `client.join` with string UIDs. */
    private String uid;
    private String rtcToken;
    private String appId;
    private OffsetDateTime scheduledStart;
    private OffsetDateTime scheduledEnd;
    private OffsetDateTime serverNow;
    private VideoCallParticipantDto doctor;
    private VideoCallParticipantDto patient;
}
