"use client"

import { Building2, Video } from "lucide-react"
import type { BookingFormat } from "./types"
import { getBookingFormatDescription, getBookingFormatLabel } from "./utils"

type Props = {
  value: BookingFormat
  onChange: (value: BookingFormat) => void
}

const OPTIONS: Array<{
  value: BookingFormat
  icon: typeof Video
}> = [
  { value: "online", icon: Video },
  { value: "offline", icon: Building2 },
]

export function BookingFormatToggle({ value, onChange }: Props) {
  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <div className="flex w-full max-w-md rounded-full border border-[#007A94] p-1 bg-[#f8fcfd]">
        {OPTIONS.map(({ value: optionValue, icon: Icon }) => {
          const active = value === optionValue
          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange(optionValue)}
              className={[
                "flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-[#007A94] text-white shadow-sm"
                  : "text-[#007A94] hover:bg-[#eef8fa]",
              ].join(" ")}
            >
              <Icon className="w-4 h-4" />
              {getBookingFormatLabel(optionValue)}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-gray-500">{getBookingFormatDescription(value)}</p>
    </div>
  )
}
