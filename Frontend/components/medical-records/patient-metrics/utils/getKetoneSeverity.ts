export type KetoneSeverity = "Normal" | "Low" | "Moderate" | "High"

export function getKetoneSeverity(
  value: number | string | null | undefined
): KetoneSeverity | null {
  if (value == null) return null
  const num = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(num)) return null
  if (num < 0.6) return "Normal"
  if (num <= 1.5) return "Moderate"
  return "High"
}

/**
 * Ketone severity tags use a dedicated palette to match the ysalus design.
 * Plain hex/inline colors keep us independent of Tailwind theme tokens
 * (which aren't configured the same way in HealthCare as in ysalus).
 */
export const KETONE_SEVERITY_STYLE: Record<
  KetoneSeverity,
  { bg: string; text: string }
> = {
  Low: {
    bg: "bg-amber-100",
    text: "text-amber-700",
  },
  Moderate: {
    bg: "bg-orange-100",
    text: "text-orange-700",
  },
  High: {
    bg: "bg-rose-100",
    text: "text-rose-700",
  },
  Normal: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
}
