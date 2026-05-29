import Link from "next/link"
import { Building2, Calendar, MapPin, Video } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { BookingFormData, BookingFormat, DoctorDetail, TimeSlot, WorkSchedule } from "./types"
import { formatArrayFieldDisplay, formatCurrency, getBookingFormatDescription, getBookingFormatLabel, getInitials } from "./utils"

type Props = {
  userName?: string
  appointmentFormat: BookingFormat
  doctor?: DoctorDetail | null
  workSchedule?: WorkSchedule | null
  selectedDate: string
  selectedSlot: TimeSlot | null
  formData: BookingFormData
  appointmentCost: number
  confirmTerms: boolean
  onConfirmTermsChange: (checked: boolean) => void
  isSubmitting: boolean
  onBack: () => void
  onConfirm: () => void
}

export function BookingStepConfirm({
  userName,
  appointmentFormat,
  doctor,
  workSchedule,
  selectedDate,
  selectedSlot,
  formData,
  appointmentCost,
  confirmTerms,
  onConfirmTermsChange,
  isSubmitting,
  onBack,
  onConfirm,
}: Props) {
  const sessionMinutes = workSchedule?.sessionDuration ?? 60
  const FormatIcon = appointmentFormat === "offline" ? Building2 : Video

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-cyan-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#007A94] rounded-full flex items-center justify-center text-white">
            <FormatIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Appointment type</p>
            <p className="font-semibold text-gray-900">{getBookingFormatLabel(appointmentFormat)}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {getBookingFormatDescription(appointmentFormat)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">{sessionMinutes} min</p>
          <p className="font-semibold text-[#007A94]">
            {selectedDate || "—"}, {selectedSlot?.displayTime || "—"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border">
        <p className="text-sm font-semibold mb-3">Patient</p>
        <div className="flex items-center gap-3">
          <Avatar className="w-11 h-11">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback className="bg-blue-100 text-[#007A94]">
              {getInitials(userName ?? "Patient")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{userName || "Patient"}</p>
          </div>
        </div>
      </div>

      {doctor ? (
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm font-semibold mb-3">Doctor</p>
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-11 h-11">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-[#007A94] text-white">
                {doctor.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{doctor.name}</p>
              <p className="text-sm text-gray-500">{formatArrayFieldDisplay(doctor.specialty)}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#007A94]" />
              <span>{doctor.workplace_name || doctor.clinic}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#007A94]" />
              <span>{doctor.province}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl p-4 border space-y-3 text-sm">
        <p className="font-semibold">Clinical details</p>
        <DetailRow label="Reason" value={formData.appointmentReason} />
        <DetailRow label="Details" value={formData.appointmentDetails} />
        <DetailRow label="Symptoms started" value={formData.symptomStartDate} />
        <DetailRow label="Severity" value={formData.symptomSeverity} />
        <DetailRow label="Medication" value={formData.medication} />
      </div>

      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Appointment fee</span>
          <span className="font-bold text-gray-900">
            {appointmentCost > 0 ? `${formatCurrency(appointmentCost)} đ` : "—"}
          </span>
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-blue-200">
          <span className="font-bold text-gray-900">Total</span>
          <span className="text-lg font-bold text-[#007A94]">
            {appointmentCost > 0 ? `${formatCurrency(appointmentCost)} đ` : "—"}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-white rounded-xl p-4 border">
        <input
          type="checkbox"
          id="confirm-terms"
          checked={confirmTerms}
          onChange={(e) => onConfirmTermsChange(e.target.checked)}
          className="w-5 h-5 mt-0.5"
        />
        <label htmlFor="confirm-terms" className="text-sm text-gray-700">
          I confirm the{" "}
          <Link href="/patient-profile" className="text-[#007A94] hover:underline font-medium">
            Privacy Policy and Terms of Use
          </Link>
        </label>
      </div>

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={!confirmTerms || isSubmitting || appointmentCost <= 0}
          className="bg-[#007A94] hover:bg-[#005566] text-white"
        >
          {isSubmitting ? "Processing..." : "Confirm and Pay"}
        </Button>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 pb-2 last:border-0">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-900 text-right">{value || "—"}</span>
    </div>
  )
}
