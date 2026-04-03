package com.example.HealthCare.service.impl;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.response.VideoCallJoinResponse;
import com.example.HealthCare.dto.response.VideoCallParticipantDto;
import com.example.HealthCare.enums.AppointmentStatus;
import com.example.HealthCare.exception.BadRequestException;
import com.example.HealthCare.exception.NotFoundException;
import com.example.HealthCare.model.Appointment;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.service.VideoCallService;

import io.agora.media.RtcTokenBuilder2;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoCallServiceImpl implements VideoCallService {

    private final AppointmentRepository appointmentRepository;

    @Value("${agora.app-id:}")
    private String agoraAppId;

    @Value("${agora.app-certificate:}")
    private String agoraAppCertificate;

    @Override
    @Transactional(readOnly = true)
    public VideoCallJoinResponse join(UUID appointmentId, UUID userId) {
        String appId = agoraAppId != null ? agoraAppId.trim() : "";
        String certificate = agoraAppCertificate != null ? agoraAppCertificate.trim() : "";
        if (appId.isEmpty() || certificate.isEmpty()) {
            throw new BadRequestException(
                    "Video call chưa được cấu hình. Thêm AGORA_APP_ID và AGORA_APP_CERTIFICATE trên server.");
        }

        Appointment appointment = appointmentRepository.findByIdWithRelations(appointmentId);
        if (appointment == null) {
            throw new NotFoundException("Appointment not found");
        }

        if (!appointment.getPatientId().equals(userId) && !appointment.getDoctorId().equals(userId)) {
            throw new BadRequestException("You do not have permission to join this call");
        }

        if (appointment.getStatus() != AppointmentStatus.IN_PROCESS) {
            throw new BadRequestException(
                    "Chỉ có thể vào video call khi lịch khám đang IN_PROCESS (bác sĩ đã xác nhận khám).");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (now.isAfter(appointment.getScheduledEnd())) {
            throw new BadRequestException("Cuộc hẹn đã qua thời gian kết thúc (scheduledEnd).");
        }

        String channel = "channel_appointment_" + appointmentId;
        String account = userId.toString();

        int tokenTtlSeconds = computeTokenTtlSeconds(now, appointment.getScheduledEnd());
        RtcTokenBuilder2 builder = new RtcTokenBuilder2();
        String rtcToken = builder.buildTokenWithUserAccount(
                appId,
                certificate,
                channel,
                account,
                RtcTokenBuilder2.Role.ROLE_PUBLISHER,
                tokenTtlSeconds,
                tokenTtlSeconds);

        if (rtcToken == null || rtcToken.isEmpty()) {
            log.error("Agora returned empty RTC token for appointment {}", appointmentId);
            throw new BadRequestException("Không tạo được token video. Kiểm tra Agora App ID / Certificate.");
        }

        VideoCallParticipantDto doctorDto = VideoCallParticipantDto.builder()
                .id(appointment.getDoctorId())
                .fullName(appointment.getDoctor() != null ? appointment.getDoctor().getFullName() : "Doctor")
                .build();

        VideoCallParticipantDto patientDto = VideoCallParticipantDto.builder()
                .id(appointment.getPatientId())
                .fullName(appointment.getPatient() != null ? appointment.getPatient().getFullName() : "Patient")
                .build();

        return VideoCallJoinResponse.builder()
                .appointmentId(appointmentId)
                .channel(channel)
                .uid(account)
                .rtcToken(rtcToken)
                .appId(appId)
                .scheduledStart(appointment.getScheduledStart())
                .scheduledEnd(appointment.getScheduledEnd())
                .serverNow(now)
                .doctor(doctorDto)
                .patient(patientDto)
                .build();
    }

    /**
     * Seconds from now until token expiry. Ensures token remains valid through scheduledEnd plus buffer,
     * capped at 24h (Agora typical limit for access tokens).
     */
    private static int computeTokenTtlSeconds(OffsetDateTime now, OffsetDateTime scheduledEnd) {
        long untilEnd = ChronoUnit.SECONDS.between(now, scheduledEnd);
        long withBuffer = untilEnd + 600L;
        long ttl = Math.max(600L, withBuffer);
        return (int) Math.min(ttl, 86400L);
    }

    @Override
    public void leave(UUID appointmentId, UUID userId) {
        Appointment appointment = appointmentRepository.findByIdWithRelations(appointmentId);
        if (appointment == null) {
            throw new NotFoundException("Appointment not found");
        }
        if (!appointment.getPatientId().equals(userId) && !appointment.getDoctorId().equals(userId)) {
            throw new BadRequestException("You do not have permission to leave this call");
        }
        // No persistence for MVP (phương án A). Hook for audit logging later.
    }
}
