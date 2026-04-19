/**
 * Ported 1:1 from ysalus-source/.../FailureStage.tsx
 * i18n keys inlined in Vietnamese; our DeviceError already holds translated
 * title/headline/bullets strings instead of i18n keys.
 */

import { CloseIcon } from "../ysalus-metrics/icons"
import { PopupButton } from "./PopupButton"
import type { DeviceError } from "./types"

interface Props {
  error: DeviceError
  onBack: () => void
  onClose: () => void
  onRetry: () => void
}

export const FailureStage = ({ error, onBack, onClose, onRetry }: Props) => {
  return (
    <div className="px-4 pb-6 pt-4 md:px-[72px] md:pb-[70px] md:pt-[40px]">
      <div className="-mx-4 sticky top-0 z-10 flex items-start justify-between border-b border-[#D8ECF1] bg-white px-4 pb-4 pt-4 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0">
        <h2 className="flex items-center gap-3 text-[18px] font-semibold text-[#151A1E] md:text-[23px]">
          <span className="text-[24px] text-[#F4B740]">⚠</span>
          {error.title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-[#97A0A6] transition hover:bg-[#F3F7F9] hover:text-[#54616B]"
          aria-label="Đóng"
        >
          <CloseIcon className="size-5 md:size-6" />
        </button>
      </div>

      <div className="mt-8 flex flex-col items-center text-center md:mt-10">
        <div className="flex size-[176px] items-center justify-center rounded-full border-[12px] border-[#FF3253] text-[96px] font-semibold text-[#FF1639] sm:size-[220px] sm:text-[124px] md:size-[260px] md:border-[16px] md:text-[150px] lg:size-[300px] lg:border-[18px] lg:text-[176px]">
          !
        </div>

        <h3 className="mt-6 text-[24px] font-semibold text-[#151A1E] md:mt-8 md:text-[32px]">
          {error.headline}
        </h3>

        <div className="mt-4 max-w-[520px] text-[16px] leading-7 text-[#4A535B] md:text-[22px] md:leading-[1.45]">
          <p>Vui lòng kiểm tra:</p>
          <ul className="mt-2 list-disc pl-6 text-left md:pl-8">
            {error.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-4 md:mt-10">
          <button
            type="button"
            onClick={onBack}
            className="text-left text-[16px] font-semibold text-[#4B5963] transition hover:text-[#0F8097] md:text-[18px]"
          >
            Quay lại danh sách thiết bị
          </button>
          <PopupButton
            variant="outline"
            onClick={onRetry}
            className="!w-full !rounded-full !border-[#126F81] !px-6 !py-3.5 !text-[16px] !font-semibold sm:!w-auto md:!px-7 md:!text-[17px]"
          >
            Thử lại
          </PopupButton>
        </div>
      </div>
    </div>
  )
}
