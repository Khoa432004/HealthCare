"use client"

import { use, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { VideoCallRoom } from "@/components/video-call/VideoCallRoom"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth.service"
import { videoCallService } from "@/services/video-call.service"
import type { VideoCallJoinData } from "@/types/video-call"

export default function VideoCallPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>
}) {
  const { appointmentId } = use(params)
  const router = useRouter()
  const [data, setData] = useState<VideoCallJoinData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const joinData = await videoCallService.join(appointmentId)
        if (!cancelled) setData(joinData)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Không thể vào phòng video."
        if (!cancelled) setError(msg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [appointmentId])

  const user = authService.getUserInfo()
  const isDoctor =
    user?.role?.toUpperCase() === "DOCTOR" || user?.role === "doctor"

  const handleLeave = useCallback(async () => {
    try {
      await videoCallService.leave(appointmentId)
    } catch {
      // Vẫn điều hướng để thoát UI
    }
    if (isDoctor) {
      router.replace(`/calendar/appointment/${appointmentId}`)
    } else {
      router.replace(`/patient-calendar/appointment/${appointmentId}`)
    }
  }, [appointmentId, isDoctor, router])

  if (loading) {
    return (
      <div className="flex h-svh items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-white/70">Đang chuẩn bị phòng video…</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-svh flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-white">
        <p className="max-w-md text-red-200">{error || "Không thể vào phòng"}</p>
        <Button variant="secondary" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    )
  }

  return <VideoCallRoom callData={data} isDoctor={isDoctor} onLeave={handleLeave} />
}
