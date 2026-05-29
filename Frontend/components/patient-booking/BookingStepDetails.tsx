import { Button } from "@/components/ui/button"
import { BookingDateTimePicker } from "./BookingDateTimePicker"
import type { BookingFormData, TimeSlot, WorkSchedule } from "./types"

type Props = {
  formData: BookingFormData
  onFormChange: (field: keyof BookingFormData, value: string | boolean) => void
  workSchedule: WorkSchedule | null
  monthOffset: number
  onMonthOffsetChange: (offset: number) => void
  selectedDate: string
  onSelectDate: (date: string) => void
  availableSlots: TimeSlot[]
  isLoadingSlots: boolean
  selectedSlot: TimeSlot | null
  onSelectSlot: (slot: TimeSlot) => void
  canProceed: boolean
  onBack: () => void
  onNext: () => void
}

export function BookingStepDetails({
  formData,
  onFormChange,
  workSchedule,
  monthOffset,
  onMonthOffsetChange,
  selectedDate,
  onSelectDate,
  availableSlots,
  isLoadingSlots,
  selectedSlot,
  onSelectSlot,
  canProceed,
  onBack,
  onNext,
}: Props) {
  return (
    <div className="space-y-6">
      <BookingDateTimePicker
        workSchedule={workSchedule}
        monthOffset={monthOffset}
        onMonthOffsetChange={onMonthOffsetChange}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        availableSlots={availableSlots}
        isLoadingSlots={isLoadingSlots}
        selectedSlot={selectedSlot}
        onSelectSlot={onSelectSlot}
      />

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Reason for appointment <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.appointmentReason}
          onChange={(e) => onFormChange("appointmentReason", e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Describe details <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.appointmentDetails}
          onChange={(e) => onFormChange("appointmentDetails", e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            When did symptoms start? <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.symptomStartDate}
            onChange={(e) => onFormChange("symptomStartDate", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Symptom severity <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.symptomSeverity}
            onChange={(e) => onFormChange("symptomSeverity", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Current medication <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.medication}
          onChange={(e) => onFormChange("medication", e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg"
          placeholder="None if not taking any"
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="agree-share"
          checked={formData.agreeToShare}
          onChange={(e) => onFormChange("agreeToShare", e.target.checked)}
          className="w-5 h-5 mt-0.5"
        />
        <label htmlFor="agree-share" className="text-sm text-gray-700">
          I agree to share my medical data with the doctor / clinic
        </label>
      </div>

      <div className="flex gap-4 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="bg-[#007A94] hover:bg-[#005566] text-white"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
