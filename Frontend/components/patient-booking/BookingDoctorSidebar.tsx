import { Clock, DollarSign, Star, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { DoctorDetail } from "./types"
import { formatArrayFieldDisplay, formatCurrency, normalizeStringList, resolveAppointmentCost } from "./utils"
import type { WorkSchedule } from "./types"

type Props = {
  doctor?: DoctorDetail | null
  workSchedule?: WorkSchedule | null
}

export function BookingDoctorSidebar({ doctor, workSchedule }: Props) {
  if (!doctor) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        Select a doctor to view profile
      </div>
    )
  }

  const cost = resolveAppointmentCost(workSchedule, doctor)
  const conditions = normalizeStringList(doctor.conditions)
  const specialty = formatArrayFieldDisplay(doctor.specialty)

  return (
    <div>
      <div className="text-center mb-6">
        <Avatar className="w-20 h-20 mx-auto mb-3">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback className="bg-[#007A94] text-white text-lg">
            {doctor.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg">{doctor.name}</h3>
        <p className="text-sm text-gray-600">{specialty}</p>
        <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-600">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          {doctor.rating} ({doctor.reviews})
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b">
        <Metric icon={Clock} label="Experience" value={doctor.experience} />
        <Metric icon={Users} label="Consultations" value={doctor.consultations} />
        <Metric
          icon={DollarSign}
          label="Cost"
          value={cost > 0 ? `${formatCurrency(cost)}đ` : "—"}
        />
      </div>

      {conditions.length > 0 ? (
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold mb-3">Treatment conditions</h4>
          <div className="flex flex-wrap gap-2">
            {conditions.map((condition) => (
              <Badge
                key={condition}
                variant="outline"
                className="rounded-full border-[#007A94] text-[#007A94] text-xs"
              >
                {condition}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {doctor.certificates?.length > 0 ? (
        <div>
          <h4 className="font-semibold mb-3">Experience & certificates</h4>
          <div className="space-y-3">
            {doctor.certificates.map((cert, index) => (
              <div key={`${cert.year}-${index}`} className="flex gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${
                    index === 0 ? "bg-[#007A94]" : "bg-blue-200"
                  }`}
                />
                <div>
                  <p className="font-medium text-sm">{cert.year}</p>
                  <p className="text-sm text-gray-500">{cert.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock
  label: string
  value: string
}) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1">
        <Icon className="w-4 h-4 text-[#007A94]" />
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xs font-semibold text-gray-900">{value}</p>
    </div>
  )
}
