/**
 * Ported 1:1 from ysalus-source/.../MeasuringStage.tsx
 * i18n keys inlined in Vietnamese.
 */

import { CircularCountdown } from "./CircularCountdown"
import { MeasurementStageHeader } from "./MeasurementStageHeader"
import type { PopupView } from "./types"

type MeasuringView = Extract<
  PopupView,
  "permission_check" | "scanning" | "device_discovered" | "connecting" | "measuring"
>

interface Props {
  displayUnitLabel: string | null
  displayValue: number | string
  isLoading?: boolean
  progressSeconds?: number | null
  progressTotalSeconds?: number | null
  measurementLoopLabel: string | null
  measurementStatusCopy: string | null
  onClose: () => void
  view: MeasuringView
}

const statusCopyMap: Record<MeasuringView, string> = {
  permission_check: "Đang chuẩn bị Bluetooth...",
  scanning: "Đang tìm kiếm thiết bị...",
  device_discovered: "Đã phát hiện thiết bị",
  connecting: "Đang kết nối thiết bị...",
  measuring: "Thư giãn và giữ yên tay",
}

export const MeasuringStage = ({
  displayUnitLabel,
  displayValue,
  isLoading = false,
  progressSeconds,
  progressTotalSeconds,
  measurementLoopLabel,
  measurementStatusCopy,
  onClose,
  view,
}: Props) => {
  const resolvedStatusCopy =
    view === "measuring" && measurementStatusCopy
      ? measurementStatusCopy
      : statusCopyMap[view]

  return (
    <div className="px-4 pb-8 pt-4 md:px-[72px] md:pb-[96px] md:pt-[40px]">
      <MeasurementStageHeader title="Đang đo" onClose={onClose} />

      <div className="mt-8 flex flex-col items-center md:mt-[78px]">
        <CircularCountdown
          isLoading={isLoading}
          progressSeconds={progressSeconds}
          totalSeconds={progressTotalSeconds}
          unitLabel={displayUnitLabel}
          value={displayValue}
        />
        {measurementLoopLabel ? (
          <p className="mt-6 text-center text-[20px] font-semibold text-[#151A1E] md:text-[28px]">
            {measurementLoopLabel}
          </p>
        ) : null}
        <p className="mt-6 text-center text-[18px] font-semibold text-[#4E555A] md:mt-8 md:text-[24px]">
          {resolvedStatusCopy}
        </p>
      </div>
    </div>
  )
}
