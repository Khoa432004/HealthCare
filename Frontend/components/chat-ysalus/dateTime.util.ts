import { format } from "date-fns"
import { enUS, vi } from "date-fns/locale"

function getDayWithSuffix(day: number, lang: "en" | "vi" = "en"): string {
  if (lang === "vi") {
    return `${day}`
  }
  if (day >= 11 && day <= 13) return `${day}th`
  const lastDigit = day % 10
  switch (lastDigit) {
    case 1:
      return `${day}st`
    case 2:
      return `${day}nd`
    case 3:
      return `${day}rd`
    default:
      return `${day}th`
  }
}

export function formatDateWithSuffix(date: Date) {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("lang")
    const lang = stored === "vi" ? "vi" : "en"
    const locale = lang === "vi" ? vi : enUS
    const month = format(date, "MMMM", { locale })
    const year = format(date, "yyyy", { locale })
    const day = getDayWithSuffix(date.getDate(), lang)
    return `${day} ${month}, ${year}`
  }
  const month = format(date, "MMMM", { locale: enUS })
  const year = format(date, "yyyy", { locale: enUS })
  const day = getDayWithSuffix(date.getDate(), "en")
  return `${day} ${month}, ${year}`
}

export function getRelativeTime(date: Date, dayCount: number = 7): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  const diffInDays = Math.floor(diffInSeconds / 86400)

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 172800) return "Yesterday"
  if (diffInDays <= dayCount) return `${diffInDays} days ago`
  return format(date, "MMM d, hh:mm a", { locale: enUS })
}

export function calculateAge(dob: string): number {
  const parts = dob.split("-").map(Number)
  if (parts.length !== 3) return 0
  const [day, month, year] = parts
  const birthDate = new Date(year, month - 1, day)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  if (!hasHadBirthdayThisYear) age--
  return age
}
