import Link from "next/link"
import { QUICK_ACTIONS } from "@/components/patient-dashboard/constants"

export function PatientDashboardQuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {QUICK_ACTIONS.map((item) => {
        const Icon = item.icon
        return (
          <Link key={item.title} href={item.href}>
            <div className="h-10 bg-gradient-to-b from-[#2aa8c6] to-[#007A94] rounded-lg px-4 flex items-center justify-between hover:opacity-95 transition-opacity">
              <span className="text-xs font-medium text-white">{item.title}</span>
              <Icon className="w-4 h-4 text-white/90" />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
