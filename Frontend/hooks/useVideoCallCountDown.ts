'use client'

import { useEffect, useRef, useState } from 'react'
import type { VideoCallJoinData } from '@/types/video-call'

function safeGetTime(value: string | undefined, fallback: number): number {
  if (value == null || value === '') return fallback
  const t = new Date(value).getTime()
  return Number.isFinite(t) ? t : fallback
}

/**
 * Counts down to `scheduledEnd`. Uses `serverNow` from join response to offset client clock skew.
 * When wall clock passes `scheduledEnd`, invokes `onComplete` once.
 */
export function useVideoCallCountDown(
  callData: VideoCallJoinData,
  onComplete?: () => void | Promise<void>
) {
  const now = Date.now()
  const end = safeGetTime(callData.scheduledEnd, now + 60 * 60 * 1000)

  const offsetRef = useRef(safeGetTime(callData.serverNow, now) - now)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const getRealNow = () => Date.now() + offsetRef.current

  const getRemainingSeconds = () => {
    const realNow = getRealNow()
    return Math.max(0, Math.floor((end - realNow) / 1000))
  }

  const warnedRef = useRef(false)
  const [secondsLeft, setSecondsLeft] = useState(getRemainingSeconds)

  useEffect(() => {
    const interval = setInterval(() => {
      const realNow = getRealNow()
      const remaining = Math.max(0, Math.floor((end - realNow) / 1000))
      setSecondsLeft(remaining)

      if (remaining <= 300 && remaining > 0 && !warnedRef.current) {
        warnedRef.current = true
      }

      if (realNow >= end) {
        setSecondsLeft(0)
        clearInterval(interval)
        void onCompleteRef.current?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [end])

  const hours = Math.floor(secondsLeft / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)
  const seconds = secondsLeft % 60
  const isWarning = secondsLeft <= 300 && secondsLeft > 0

  return { hours, minutes, seconds, isWarning }
}
