import {
  Activity,
  Calendar,
  Droplets,
  FlaskConical,
  HeartPulse,
  LineChart,
  Plus,
  TestTube2,
  type LucideIcon,
} from "lucide-react"

export const QUICK_ACTIONS = [
  { title: "Book Appointment", icon: Calendar, href: "/patient-calendar/booking" },
  { title: "Add Measurement", icon: Plus, href: "/health-tracking" },
  { title: "View Metrics Log", icon: LineChart, href: "/health-tracking" },
  { title: "Health Test", icon: FlaskConical, href: "/health-tracking" },
] as const

export const METRIC_ICON_MAP: Record<string, LucideIcon> = {
  "Blood Glucose": Droplets,
  Hematocrit: Activity,
  Ketone: TestTube2,
  "Heart Rate": HeartPulse,
  Cholesterol: Activity,
  "Uric Acid": TestTube2,
  "Blood Pressure": HeartPulse,
}

export const METRIC_TONE_MAP: Record<string, string> = {
  High: "text-red-600 bg-red-50 border-red-100",
  Low: "text-amber-600 bg-amber-50 border-amber-100",
  Upper: "text-orange-600 bg-orange-50 border-orange-100",
  Normal: "text-emerald-600 bg-emerald-50 border-emerald-100",
  "N/A": "text-slate-600 bg-slate-50 border-slate-100",
}

export const SMART_DEVICES = [
  { name: "Vòng tay sức khỏe", model: "CardioMood 287-2", badge: "New" },
  { name: "Máy đo đường huyết", model: "FORA® 6 Connect", badge: "Best Seller" },
  { name: "Máy đo điện tim", model: "KardiaMobile 6L", badge: "Best Seller" },
  { name: "Máy đo huyết áp", model: "Diamond Cuff P80", badge: null },
] as const

export const DASHBOARD_QUOTE =
  "It is health that is real wealth and not pieces of gold and silver."
