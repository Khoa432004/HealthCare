import { ChevronRight } from "lucide-react"
import { SMART_DEVICES } from "@/components/patient-dashboard/constants"
import { Badge } from "@/components/ui/badge"

export function PatientDashboardSmartDevices() {
  return (
    <section className="rounded-xl border border-[#c8dbe2] bg-[#d5e5eb] p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[#0f172a]">
          Smart devices for a healthy life
        </h3>
        <button
          type="button"
          className="text-[11px] text-[#007A94] inline-flex items-center gap-1"
        >
          See details <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {SMART_DEVICES.map((device) => (
          <div
            key={device.model}
            className="rounded-xl border border-[#d6edf2] bg-white p-3 hover:shadow-sm transition-shadow"
          >
            {device.badge ? (
              <Badge className="mb-2 bg-[#e8f4f7] text-[#007A94] border-0 text-[10px]">
                {device.badge}
              </Badge>
            ) : (
              <div className="h-5" />
            )}
            <p className="text-xs font-semibold text-[#0f172a]">{device.name}</p>
            <p className="text-[11px] text-gray-500 mt-1">{device.model}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
