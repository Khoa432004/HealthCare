"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

type AiFloatingChatContextValue = {
  suppressed: boolean
  setSuppressed: (value: boolean) => void
}

const AiFloatingChatContext = createContext<AiFloatingChatContextValue | null>(null)

export function AiFloatingChatProvider({ children }: { children: ReactNode }) {
  const [suppressed, setSuppressed] = useState(false)
  const value = useMemo(
    () => ({
      suppressed,
      setSuppressed,
    }),
    [suppressed]
  )
  return <AiFloatingChatContext.Provider value={value}>{children}</AiFloatingChatContext.Provider>
}

export function useAiFloatingChatContext() {
  const ctx = useContext(AiFloatingChatContext)
  if (!ctx) {
    throw new Error("useAiFloatingChatContext must be used within AiFloatingChatProvider")
  }
  return ctx
}

/** Ẩn bubble AI nổi khi component này được mount (chat module, video call, …). */
export function SuppressAiFloatingChat() {
  const { setSuppressed } = useAiFloatingChatContext()
  useEffect(() => {
    setSuppressed(true)
    return () => setSuppressed(false)
  }, [setSuppressed])
  return null
}
