/**
 * Ported 1:1 from ysalus-source/.../EntryModeHeader.tsx
 * i18n keys inlined in Vietnamese.
 */

import { CloseIcon } from "../ysalus-metrics/icons"
import type { PopupMode } from "./types"

interface Props {
  activeMode: PopupMode
  onClose: () => void
  onModeChange: (mode: PopupMode) => void
}

const MODE_LABEL: Record<PopupMode, string> = {
  manual: "Nhập tay",
  device: "Thiết bị",
}

export const EntryModeHeader = ({
  activeMode,
  onClose,
  onModeChange,
}: Props) => {
  return (
    <div className="-mx-4 sticky top-0 z-10 border-b border-[#D8ECF1] bg-white px-4 pb-4 pt-4 md:static md:mx-0 md:bg-transparent md:px-0 md:pb-6 md:pt-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-6 md:gap-10">
          {(["manual", "device"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onModeChange(item)}
              className={`relative pb-2 text-[16px] font-semibold transition md:pb-3 md:text-[18px] ${
                activeMode === item ? "text-[#0F8097]" : "text-[#151A1E]"
              }`}
            >
              {MODE_LABEL[item]}
              {activeMode === item ? (
                <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[#0F8097]" />
              ) : null}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-[#97A0A6] transition hover:bg-[#F3F7F9] hover:text-[#54616B]"
          aria-label="Đóng"
        >
          <CloseIcon className="size-6 md:size-7" />
        </button>
      </div>
    </div>
  )
}
