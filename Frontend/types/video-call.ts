export type VideoCallParticipant = {
  id: string
  fullName: string
}

export type VideoCallJoinData = {
  appointmentId: string
  channel: string
  uid: string
  rtcToken: string
  appId: string
  scheduledStart: string
  scheduledEnd: string
  serverNow: string
  doctor: VideoCallParticipant
  patient: VideoCallParticipant
}
