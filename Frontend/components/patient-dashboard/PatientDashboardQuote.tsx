import { DASHBOARD_QUOTE } from "@/components/patient-dashboard/constants"

export function PatientDashboardQuote() {
  return (
    <section className="rounded-xl border border-[#c8dbe2] bg-gradient-to-r from-[#e8f5f1] to-[#dff2f7] p-4">
      <h3 className="text-xs font-semibold text-[#0f172a] mb-2">Today&apos;s Quote</h3>
      <p className="text-sm italic text-[#334155] leading-relaxed">
        &ldquo;{DASHBOARD_QUOTE}&rdquo;
      </p>
    </section>
  )
}
