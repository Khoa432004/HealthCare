/**
 * Ported 1:1 from ysalus-source/.../EntrySelectionStage.tsx
 * i18n keys inlined in Vietnamese.
 */

import { PopupButton } from "./PopupButton"
import { DeviceEmptyIllustration } from "./DeviceEmptyIllustration"
import { DeviceListCard } from "./DeviceListCard"
import { EntryModeHeader } from "./EntryModeHeader"
import { ManualMetricSelectionStage } from "./ManualMetricSelectionStage"
import type {
  DeviceDefinition,
  ManualMetricType,
  PopupMode,
} from "./types"

interface Props {
  devices: DeviceDefinition[]
  isSavePending: boolean
  mode: PopupMode
  onAddDevices: () => void
  onClose: () => void
  onModeChange: (mode: PopupMode) => void
  onReviewManual: () => void
  onSelectManualMetric: (metricType: ManualMetricType) => void
  onTakeExamination: (deviceId: DeviceDefinition["id"]) => void
  selectedManualMetric: ManualMetricType | null
}

export const EntrySelectionStage = ({
  devices,
  isSavePending,
  mode,
  onAddDevices,
  onClose,
  onModeChange,
  onReviewManual,
  onSelectManualMetric,
  onTakeExamination,
  selectedManualMetric,
}: Props) => {
  if (mode === "manual") {
    return (
      <ManualMetricSelectionStage
        isSavePending={isSavePending}
        onClose={onClose}
        onModeChange={onModeChange}
        onReview={onReviewManual}
        onSelectMetric={onSelectManualMetric}
        selectedMetric={selectedManualMetric}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-5 pt-4 md:gap-10 md:px-[56px] md:pb-[48px] md:pt-[40px]">
      <EntryModeHeader
        activeMode={mode}
        onClose={onClose}
        onModeChange={onModeChange}
      />

      <div className="flex flex-col gap-6 md:gap-10">
        <section className="flex flex-col gap-5 md:gap-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <h3 className="shrink-0 text-[18px] font-semibold text-[#151A1E] md:text-[22px]">
              Thiết bị của tôi
            </h3>
            <div className="hidden h-px flex-1 bg-[#D8ECF1] sm:block" />
            <PopupButton
              onClick={onAddDevices}
              className="!w-full !bg-[#126F81] !px-5 !py-3 !text-[16px] !font-semibold !shadow-none sm:!w-auto md:!px-8 md:!py-4 md:!text-[18px]"
            >
              Thêm thiết bị
            </PopupButton>
          </div>

          {devices.length > 0 ? (
            <div className="custom-scrollbar max-h-[min(46dvh,408px)] space-y-3 overflow-y-auto md:space-y-4 md:pr-3">
              {devices.map((device) => (
                <DeviceListCard
                  key={device.id}
                  device={device}
                  onTakeExamination={onTakeExamination}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[24px] bg-white px-5 py-8 md:min-h-[360px] md:rounded-[30px]">
              <DeviceEmptyIllustration />
              <p className="mt-5 text-center text-[16px] font-semibold text-[#5C6670] md:mt-6 md:text-[18px]">
                Chưa có thiết bị khả dụng
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
