/**
 * Ported 1:1 from ysalus-source/.../MeasurementStageHeader.tsx
 */

import { CloseIcon } from "../ysalus-metrics/icons"

interface Props {
  title: string
  onClose: () => void
  titleClassName?: string
}

export const MeasurementStageHeader = ({
  title,
  onClose,
  titleClassName,
}: Props) => {
  return (
    <div className="-mx-4 sticky top-0 z-10 flex items-start justify-between border-b border-[#D8ECF1] bg-white px-4 pb-4 pt-4 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0">
      <h2
        className={`text-[18px] leading-tight font-semibold text-[#151A1E] md:text-[23px] md:leading-none ${
          titleClassName ?? ""
        }`}
      >
        {title}
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
  )
}
