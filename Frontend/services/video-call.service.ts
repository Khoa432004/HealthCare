import { apiClient } from '@/lib/api-client'
import type { VideoCallJoinData } from '@/types/video-call'

function normalizeJoinPayload(raw: Record<string, unknown>): VideoCallJoinData {
  const doctor = raw.doctor as Record<string, unknown>
  const patient = raw.patient as Record<string, unknown>
  return {
    appointmentId: String(raw.appointmentId ?? ''),
    channel: String(raw.channel ?? ''),
    uid: String(raw.uid ?? ''),
    rtcToken: String(raw.rtcToken ?? ''),
    appId: String(raw.appId ?? ''),
    scheduledStart: String(raw.scheduledStart ?? ''),
    scheduledEnd: String(raw.scheduledEnd ?? ''),
    serverNow: String(raw.serverNow ?? ''),
    doctor: {
      id: String(doctor?.id ?? ''),
      fullName: String(doctor?.fullName ?? ''),
    },
    patient: {
      id: String(patient?.id ?? ''),
      fullName: String(patient?.fullName ?? ''),
    },
  }
}

export const videoCallService = {
  async join(appointmentId: string): Promise<VideoCallJoinData> {
    const res = (await apiClient.post(`/api/v1/video-calls/join`, {
      appointmentId,
    })) as { success?: boolean; data?: Record<string, unknown>; message?: string }

    if (res?.success && res.data) {
      return normalizeJoinPayload(res.data)
    }
    throw new Error(res?.message || 'Không thể tham gia cuộc gọi video.')
  },

  async leave(appointmentId: string): Promise<void> {
    await apiClient.post(`/api/v1/video-calls/leave`, { appointmentId })
  },
}
