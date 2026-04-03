'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AgoraRTC, {
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng'
import { FileText, Mic, MicOff, Video, VideoOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useVideoCallCountDown } from '@/hooks/useVideoCallCountDown'
import type { VideoCallJoinData } from '@/types/video-call'
import { VideoCallMedicalReportPanel } from '@/components/video-call/VideoCallMedicalReportPanel'

type Props = {
  callData: VideoCallJoinData
  isDoctor: boolean
  onLeave: () => Promise<void>
}

export function VideoCallRoom({ callData, isDoctor, onLeave }: Props) {
  const { toast } = useToast()
  const client = useMemo(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }), [])
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([])
  const [medicalReportOpen, setMedicalReportOpen] = useState(false)
  const [isDeviceReady, setDeviceReady] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const leavingRef = useRef(false)
  const [rtcPhase, setRtcPhase] = useState<'idle' | 'connecting' | 'ready' | 'error'>('idle')
  const [rtcError, setRtcError] = useState<string | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  /** Tăng mỗi khi subscribe lại video remote (kể cả cùng uid) để ép play() khi SDK giữ nguyên getTrackId() */
  const [remoteVideoEpoch, setRemoteVideoEpoch] = useState(0)

  const localTracksRef = useRef<{ audio: IMicrophoneAudioTrack | null; video: ICameraVideoTrack | null }>({
    audio: null,
    video: null,
  })
  const mainVideoRef = useRef<HTMLDivElement | null>(null)
  const pipVideoRef = useRef<HTMLDivElement | null>(null)

  const mainRemoteUser = useMemo(() => {
    const targetUid = isDoctor ? callData.patient.id : callData.doctor.id
    const match = remoteUsers.find((u) => String(u.uid) === targetUid)
    return match ?? remoteUsers[0]
  }, [remoteUsers, isDoctor, callData.patient.id, callData.doctor.id])

  const stopLocalTracks = useCallback(() => {
    if (localTracksRef.current.audio) {
      localTracksRef.current.audio.stop()
      localTracksRef.current.audio.close()
      localTracksRef.current.audio = null
    }
    if (localTracksRef.current.video) {
      localTracksRef.current.video.stop()
      localTracksRef.current.video.close()
      localTracksRef.current.video = null
    }
  }, [])

  const mergeRemoteUser = useCallback((prev: IAgoraRTCRemoteUser[], user: IAgoraRTCRemoteUser) => {
    const i = prev.findIndex((u) => u.uid === user.uid)
    if (i >= 0) {
      const next = [...prev]
      next[i] = user
      return next
    }
    return [...prev, user]
  }, [])

  const attachRtcListeners = useCallback(
    (rtcClient: IAgoraRTCClient) => {
      rtcClient.on('user-published', async (user, mediaType) => {
        try {
          await rtcClient.subscribe(user, mediaType)
        } catch (e) {
          if (isAgoraOperationAborted(e)) return
          console.warn('Agora subscribe error:', e)
          return
        }
        setRemoteUsers((prev) => mergeRemoteUser(prev, user))
        if (mediaType === 'video') {
          setRemoteVideoEpoch((n) => n + 1)
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play()
        }
      })
      rtcClient.on('user-unpublished', async (user, mediaType) => {
        try {
          await rtcClient.unsubscribe(user, mediaType)
        } catch (e) {
          if (isAgoraOperationAborted(e)) return
          console.warn('Agora unsubscribe error:', e)
        }
        setRemoteUsers((prev) => mergeRemoteUser(prev, user))
        if (mediaType === 'video') {
          setRemoteVideoEpoch((n) => n + 1)
        }
      })
      rtcClient.on('user-left', (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
      })
    },
    [mergeRemoteUser]
  )

  const leaveChannel = useCallback(async () => {
    try {
      stopLocalTracks()
      if (client.connectionState !== 'DISCONNECTED') {
        await client.leave()
      }
      client.removeAllListeners()
    } catch (e) {
      if (!isAgoraOperationAborted(e)) console.error('leaveChannel error', e)
    } finally {
      setRemoteUsers([])
      setDeviceReady(false)
      setMicOn(true)
      setCameraOn(true)
      setRemoteVideoEpoch(0)
    }
  }, [client, stopLocalTracks])

  const handleToggleMic = useCallback(async () => {
    const track = localTracksRef.current.audio
    if (!track) return
    const next = !micOn
    try {
      await track.setEnabled(next)
      setMicOn(next)
    } catch (e) {
      console.error('toggle mic', e)
      toast({
        title: 'Không thể đổi mic',
        description: e instanceof Error ? e.message : 'Thử lại sau.',
        variant: 'destructive',
      })
    }
  }, [micOn, toast])

  const handleToggleCamera = useCallback(async () => {
    const track = localTracksRef.current.video
    if (!track) return
    const next = !cameraOn
    try {
      /** Chỉ dùng setEnabled: Agora báo user-unpublished / user-published cho phía xa; tránh unpublish+publish chồng lên. */
      await track.setEnabled(next)
      setCameraOn(next)
      if (next && pipVideoRef.current) track.play(pipVideoRef.current)
    } catch (e) {
      console.error('toggle camera', e)
      toast({
        title: 'Không thể đổi camera',
        description: e instanceof Error ? e.message : 'Thử lại sau.',
        variant: 'destructive',
      })
    }
  }, [cameraOn, toast])

  const handleLeaveClick = useCallback(async () => {
    if (leavingRef.current) return
    leavingRef.current = true
    setLeaving(true)
    try {
      await leaveChannel()
      await onLeave()
    } finally {
      setLeaving(false)
      leavingRef.current = false
    }
  }, [leaveChannel, onLeave])

  const handleToggleMedicalReport = useCallback(() => {
    if (remoteUsers.length === 0) {
      toast({
        title: 'Chưa thể mở',
        description: 'Vui lòng chờ bệnh nhân đã vào phòng video để mở báo cáo y tế.',
        variant: 'destructive',
      })
      return
    }
    setMedicalReportOpen((prev) => !prev)
  }, [remoteUsers.length, toast])

  const { hours, minutes, seconds, isWarning } = useVideoCallCountDown(callData, () => {
    void handleLeaveClick()
  })

  /**
   * Gom join vào một effect + cờ `cancelled` để React Strict Mode (dev) không coi teardown
   * là lỗi AgoraRTCError OPERATION_ABORTED / "cancel token canceled".
   */
  useEffect(() => {
    let cancelled = false
    const resolvedAppId = (callData.appId || '').trim()

    async function run() {
      if (!resolvedAppId) {
        if (!cancelled) {
          setRtcPhase('error')
          setRtcError('Thiếu App ID Agora từ server. Kiểm tra AGORA_APP_ID trên backend.')
        }
        return
      }

      if (!cancelled) {
        setRtcPhase('connecting')
        setRtcError(null)
      }

      try {
        client.removeAllListeners()
        attachRtcListeners(client)
        await client.join(resolvedAppId, callData.channel, callData.rtcToken, callData.uid)

        if (cancelled) {
          await client.leave().catch(() => {})
          return
        }

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
        if (cancelled) {
          audioTrack.stop()
          audioTrack.close()
          videoTrack.stop()
          videoTrack.close()
          await client.leave().catch(() => {})
          return
        }

        localTracksRef.current = { audio: audioTrack, video: videoTrack }
        await client.publish([audioTrack, videoTrack])

        if (cancelled) {
          audioTrack.stop()
          audioTrack.close()
          videoTrack.stop()
          videoTrack.close()
          await client.leave().catch(() => {})
          return
        }

        const pipEl = pipVideoRef.current
        if (pipEl) videoTrack.play(pipEl)
        if (!cancelled) {
          setRtcPhase('ready')
          setDeviceReady(true)
        }
      } catch (err: unknown) {
        if (cancelled || isAgoraOperationAborted(err)) return
        if (!cancelled) {
          setRtcPhase('error')
          const msg = err instanceof Error ? err.message : String(err ?? 'Unknown error')
          setRtcError(
            msg ||
              'Không thể bắt đầu cuộc gọi. Kiểm tra quyền camera/mic và kết nối mạng.'
          )
          console.error('Agora join/publish failed:', err)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
      stopLocalTracks()
      client.removeAllListeners()
      void client.leave().catch(() => {})
    }
  }, [
    attachRtcListeners,
    callData.appId,
    callData.channel,
    callData.rtcToken,
    callData.uid,
    client,
    stopLocalTracks,
  ])

  /**
   * Phải phụ thuộc identity của remote video track, không chỉ `mainRemoteUser`:
   * SDK thường mutate cùng object IAgoraRTCRemoteUser khi bật lại camera → reference user không đổi
   * nhưng videoTrack là instance mới → effect cũ không chạy lại và đối phương thấy màn đen.
   */
  const remoteMainTrackId = mainRemoteUser?.videoTrack?.getTrackId?.() ?? null

  useEffect(() => {
    const u = mainRemoteUser
    const el = mainVideoRef.current
    const vt = u?.videoTrack
    if (!vt || !el) return

    try {
      if (vt.isPlaying) vt.stop()
    } catch {
      /* ignore */
    }
    vt.play(el)

    const replay = () => {
      const container = mainVideoRef.current
      if (container) vt.play(container)
    }
    vt.on('first-frame-decoded', replay)
    return () => {
      vt.off('first-frame-decoded', replay)
      try {
        if (vt.isPlaying) vt.stop()
      } catch {
        /* ignore */
      }
    }
  }, [mainRemoteUser?.uid, remoteMainTrackId, remoteVideoEpoch])

  const mainParticipantLabel = isDoctor ? callData.patient.fullName : callData.doctor.fullName
  const waitingLabel = isDoctor
    ? 'Đang chờ bệnh nhân tham gia…'
    : 'Đang chờ bác sĩ tham gia…'

  return (
    <div className="flex h-svh flex-col bg-slate-950">
      <div className="relative flex flex-1 flex-col gap-4 overflow-hidden border-b border-white/10 p-4 md:flex-row md:gap-6 md:p-6">
        <div className="relative h-full min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl ring-1 ring-white/10">
          {/* Khung lớn: luôn là video đối phương (BS → BN lớn, BN → BS lớn) */}
          <div
            key={`${remoteMainTrackId ?? 'no'}-${remoteVideoEpoch}-${String(mainRemoteUser?.uid ?? '')}`}
            ref={mainVideoRef}
            className="relative h-full min-h-[240px] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-2xl md:min-h-0"
          >
            {!isDeviceReady && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 px-6 text-center text-sm text-white/90">
                {rtcPhase === 'connecting' && <p>Đang kết nối camera và vào phòng…</p>}
                {rtcPhase === 'error' && rtcError && (
                  <p className="max-w-md text-red-200">{rtcError}</p>
                )}
                {rtcPhase === 'idle' && <p>Đang chuẩn bị video…</p>}
              </div>
            )}
            {isDeviceReady && !mainRemoteUser?.videoTrack && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-900/90 px-6 text-center text-sm text-white/80">
                <p>{waitingLabel}</p>
              </div>
            )}
            {isDeviceReady && mainRemoteUser?.videoTrack && (
              <div className="absolute bottom-4 left-4 z-10 w-fit max-w-[min(100%-2rem,28rem)] rounded-full bg-black/60 px-4 py-2 backdrop-blur-sm">
                <span className="truncate font-semibold text-lg text-white">{mainParticipantLabel}</span>
              </div>
            )}
          </div>

          {/* Khung nhỏ (PiP): video của chính mình */}
          <div className="pointer-events-none absolute bottom-4 right-4 z-30">
            <div className="pointer-events-auto relative h-40 w-40 overflow-hidden rounded-xl bg-slate-900 shadow-2xl ring-2 ring-[#16a1bd]/40 md:h-52 md:w-52">
              <div ref={pipVideoRef} className="h-full w-full" />
              {isDeviceReady && !cameraOn && (
                <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-1 bg-slate-800 px-2 text-center">
                  <VideoOff className="size-8 text-white/70" aria-hidden />
                  <span className="text-[10px] font-medium text-white/85 md:text-xs">Camera tắt</span>
                </div>
              )}
              {isDeviceReady && (
                <div className="pointer-events-none absolute bottom-2 left-2 z-10 max-w-[90%] truncate rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-medium text-white md:text-xs">
                  <MetaName callData={callData} uid={callData.uid} />
                </div>
              )}
            </div>
          </div>
        </div>

        {isDoctor && medicalReportOpen && remoteUsers.length > 0 && (
          <VideoCallMedicalReportPanel
            appointmentId={callData.appointmentId}
            onClose={() => setMedicalReportOpen(false)}
            onReportCompleted={() => setMedicalReportOpen(false)}
          />
        )}
      </div>

      <footer className="grid gap-4 bg-gradient-to-br from-[#01D2D5] via-[#16a1bd] to-[#0d6171] p-4 text-white md:grid-cols-3 md:gap-8 md:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10">
            <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M19 3h-1V2a1 1 0 10-2 0v1H8V2a1 1 0 10-2 0v1H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V8h14v11z" />
            </svg>
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap gap-2">
              <Badge className="border-0 bg-white/20 text-xs text-white hover:bg-white/25">
              Cuộc hẹn (khung giờ)
              </Badge>
              <Badge className="border-0 bg-black/20 text-xs text-white hover:bg-black/25">
                {isDoctor ? 'Bác sĩ' : 'Bệnh nhân'}
              </Badge>
            </div>
            <p className="truncate text-sm opacity-95">
              {formatRange(callData.scheduledStart, callData.scheduledEnd)}
            </p>
            <p className="truncate text-xs opacity-80">
              BS: {callData.doctor.fullName} · BN: {callData.patient.fullName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {isDeviceReady && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className={`size-12 shrink-0 rounded-2xl border-0 ${
                  micOn
                    ? 'bg-white/95 text-[#0d6171] hover:bg-white'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                onClick={() => void handleToggleMic()}
                title={micOn ? 'Tắt mic' : 'Bật mic'}
                aria-label={micOn ? 'Tắt mic' : 'Bật mic'}
                aria-pressed={micOn}
              >
                {micOn ? <Mic className="size-6" /> : <MicOff className="size-6" />}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className={`size-12 shrink-0 rounded-2xl border-0 ${
                  cameraOn
                    ? 'bg-white/95 text-[#0d6171] hover:bg-white'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                onClick={() => void handleToggleCamera()}
                title={cameraOn ? 'Tắt camera' : 'Bật camera'}
                aria-label={cameraOn ? 'Tắt camera' : 'Bật camera'}
                aria-pressed={cameraOn}
              >
                {cameraOn ? <Video className="size-6" /> : <VideoOff className="size-6" />}
              </Button>
              {isDoctor && (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className={`size-12 shrink-0 rounded-2xl border-0 ${
                    medicalReportOpen ? 'bg-white text-[#0d6171] ring-2 ring-white' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  onClick={handleToggleMedicalReport}
                  title="Medical Report"
                  aria-label="Medical Report"
                  aria-pressed={medicalReportOpen}
                >
                  <FileText className="size-6" />
                </Button>
              )}
            </>
          )}
          <Button
            type="button"
            disabled={leaving}
            className="size-14 rounded-full border-0 bg-red-600 px-0 hover:bg-red-700"
            onClick={() => void handleLeaveClick()}
            aria-label="Kết thúc cuộc gọi"
          >
            <PhoneOffIcon className="mx-auto size-7 text-white" />
          </Button>
        </div>

        <div className="flex items-center justify-center md:justify-end">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold tabular-nums ${
              isWarning
                ? 'bg-amber-500/90 text-slate-950'
                : 'bg-white/15 text-white ring-1 ring-white/25'
            }`}
          >
            <span
              className={`inline-block size-2 shrink-0 rounded-full ${
                isWarning ? 'bg-red-600' : 'bg-emerald-400'
              }`}
            />
            <span>
              Còn lại: {pad(hours)}:{pad(minutes)}:{pad(seconds)}
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

/** Lỗi do hủy thao tác (Strict Mode unmount / leave sớm) — không hiển thị như lỗi thật. */
function isAgoraOperationAborted(err: unknown): boolean {
  if (err == null || typeof err !== 'object') return false
  const e = err as { code?: string; message?: string }
  const msg = typeof e.message === 'string' ? e.message : ''
  return (
    e.code === 'OPERATION_ABORTED' ||
    msg.includes('OPERATION_ABORTED') ||
    msg.includes('cancel token')
  )
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function formatRange(startIso: string, endIso: string) {
  try {
    const s = new Date(startIso)
    const e = new Date(endIso)
    if (!Number.isFinite(s.getTime()) || !Number.isFinite(e.getTime())) return '—'
    return `${s.toLocaleString('vi-VN')} — ${e.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  } catch {
    return '—'
  }
}

function MetaName({
  callData,
  uid,
  large,
}: {
  callData: VideoCallJoinData
  uid: string
  large?: boolean
}) {
  const name = useMemo(() => {
    if (callData.doctor.id === uid) return callData.doctor.fullName
    if (callData.patient.id === uid) return callData.patient.fullName
    return '—'
  }, [callData, uid])
  return (
    <span className={`font-semibold text-white ${large ? 'text-lg' : 'text-xs'}`}>{name}</span>
  )
}

function PhoneOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M6.91824 23.8153L9.9862 21.3692C10.7225 20.7846 11.152 19.8922 11.152 18.9538V14.9538C15.7846 13.4461 20.8007 13.4307 25.4487 14.9538V18.9692C25.4487 19.9076 25.8782 20.7999 26.6145 21.3846L29.6671 23.8153C30.8943 24.7846 32.643 24.6922 33.7475 23.5846L35.6189 21.7076C36.8461 20.4769 36.8461 18.4307 35.5422 17.2769C25.7094 8.56917 10.8912 8.56917 1.05845 17.2769C-0.245425 18.4307 -0.245425 20.4769 0.981756 21.7076L2.85321 23.5846C3.94233 24.6922 5.69106 24.7846 6.91824 23.8153Z"
      />
    </svg>
  )
}
