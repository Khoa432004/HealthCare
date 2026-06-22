export type AppointmentFormat = "online" | "offline"

export function resolveAppointmentFormatFromTitle(title?: string | null): AppointmentFormat {
  const value = (title ?? "").toLowerCase()
  if (value.startsWith("at clinic") || value.includes("offline") || value.includes("in-person")) {
    return "offline"
  }
  return "online"
}

export function getAppointmentLocationLabel(title?: string | null): string {
  return resolveAppointmentFormatFromTitle(title) === "offline" ? "At Clinic" : "Online"
}
