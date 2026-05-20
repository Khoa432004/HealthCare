"use client"

import { useCallback, useEffect, useState } from "react"

export const DOCTOR_SIDEBAR_KEY = "doctor-sidebar-expanded"
export const PATIENT_SIDEBAR_KEY = "patient-sidebar-expanded"

export type SidebarRole = "doctor" | "patient"

const KEY_BY_ROLE: Record<SidebarRole, string> = {
  doctor: DOCTOR_SIDEBAR_KEY,
  patient: PATIENT_SIDEBAR_KEY,
}

const EVENT_NAME = "imed-sidebar-change"

function readExpanded(storageKey: string): boolean {
  if (typeof window === "undefined") return true
  const saved = localStorage.getItem(storageKey)
  if (saved === null) return true
  return saved === "true"
}

/** Notify other hook instances after the current render commit. */
function notifySidebarChange(storageKey: string) {
  queueMicrotask(() => {
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { key: storageKey } })
    )
  })
}

export function useSidebarExpanded(role: SidebarRole) {
  const storageKey = KEY_BY_ROLE[role]
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    setIsExpanded(readExpanded(storageKey))

    const sync = (event: Event) => {
      const detail = (event as CustomEvent<{ key?: string }>).detail
      if (!detail?.key || detail.key === storageKey) {
        queueMicrotask(() => {
          setIsExpanded(readExpanded(storageKey))
        })
      }
    }

    window.addEventListener(EVENT_NAME, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(EVENT_NAME, sync)
      window.removeEventListener("storage", sync)
    }
  }, [storageKey])

  const setExpanded = useCallback(
    (next: boolean) => {
      localStorage.setItem(storageKey, String(next))
      setIsExpanded(next)
      notifySidebarChange(storageKey)
    },
    [storageKey]
  )

  const toggle = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev
      localStorage.setItem(storageKey, String(next))
      return next
    })
    notifySidebarChange(storageKey)
  }, [storageKey])

  return { isExpanded, setExpanded, toggle }
}
