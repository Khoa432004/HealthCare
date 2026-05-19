"use client"

import { useEffect, useState } from "react"

/**
 * Breakpoint hook ported from ysalus-source/ysalus-web/src/core/hooks/useBreakpoint.ts.
 *
 * Unlike ysalus we don't expose CSS variables for breakpoints in the global
 * stylesheet, so we hardcode the Tailwind v4 defaults directly. If you change
 * the Tailwind theme breakpoints, update this map accordingly.
 */
type Breakpoint = "xs" | "2xsm" | "xsm" | "sm" | "md" | "lg" | "xl" | "2xl"

const ORDER: Breakpoint[] = [
  "xs",
  "2xsm",
  "xsm",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
]

const BREAKPOINTS: Record<Exclude<Breakpoint, "xs">, number> = {
  "2xsm": 360,
  xsm: 400,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

function getCurrent(width: number): Breakpoint {
  if (width >= BREAKPOINTS["2xl"]) return "2xl"
  if (width >= BREAKPOINTS.xl) return "xl"
  if (width >= BREAKPOINTS.lg) return "lg"
  if (width >= BREAKPOINTS.md) return "md"
  if (width >= BREAKPOINTS.sm) return "sm"
  if (width >= BREAKPOINTS.xsm) return "xsm"
  if (width >= BREAKPOINTS["2xsm"]) return "2xsm"
  return "xs"
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("lg")

  useEffect(() => {
    const update = () => setBreakpoint(getCurrent(window.innerWidth))
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return {
    breakpoint,
    isAtLeast: (bp: Breakpoint) => ORDER.indexOf(breakpoint) >= ORDER.indexOf(bp),
    isAtMost: (bp: Breakpoint) => ORDER.indexOf(breakpoint) <= ORDER.indexOf(bp),
  }
}

export default useBreakpoint
