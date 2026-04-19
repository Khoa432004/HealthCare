/**
 * Ported 1:1 from ysalus-source/.../DeviceListCard.tsx
 * i18n keys inlined in Vietnamese.
 */

import Image from "next/image"
import type { DeviceDefinition } from "./types"

interface Props {
  device: DeviceDefinition
  onTakeExamination: (deviceId: DeviceDefinition["id"]) => void
}

export const DeviceListCard = ({ device, onTakeExamination }: Props) => {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-[#D7EBF2] bg-white px-4 py-4 sm:flex-row sm:items-center sm:gap-5 md:min-h-[126px] md:gap-7 md:rounded-[24px] md:px-8 md:py-6">
      <div className="flex min-w-0 flex-1 items-start gap-4 md:items-center">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center md:h-[72px] md:w-[72px]">
          <Image
            src={device.thumbnailSrc}
            alt={device.displayName}
            fill
            sizes="72px"
            className="object-contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold text-[#22262A] md:text-[18px]">
            {device.displayName}
          </p>
          <p className="mt-1 text-[14px] text-[#5F6A73] md:text-[15px]">
            Lần đo gần nhất {device.latestExaminationAt}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="w-full shrink-0 rounded-full border border-[#1D89A2] px-5 py-3 text-[15px] font-semibold text-[#1D89A2] transition hover:bg-[#F2FBFD] sm:w-auto md:px-8 md:py-4 md:text-[17px]"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onTakeExamination(device.id)
        }}
      >
        Đo ngay
      </button>
    </div>
  )
}
