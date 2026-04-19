/**
 * Ported 1:1 from ysalus-source/.../SetupGuideStage.tsx
 * i18n keys inlined in Vietnamese. Our DeviceDefinition.setupInstructions
 * already contains translated strings, whereas ysalus used setupInstructionKeys.
 */

"use client"

import Image from "next/image"
import { useFormContext } from "react-hook-form"
import { InfoIcon } from "../ysalus-metrics/icons"
import { MeasurementStageHeader } from "./MeasurementStageHeader"
import { PopupButton } from "./PopupButton"
import type {
  DeviceDefinition,
  MeasurementContextFormValues,
} from "./types"

interface Props {
  device: DeviceDefinition
  onBack: () => void
  onClose: () => void
  onStartConnect: () => void
}

export const SetupGuideStage = ({
  device,
  onBack,
  onClose,
  onStartConnect,
}: Props) => {
  const { register } = useFormContext<MeasurementContextFormValues>()
  const showAverageMode = device.capabilities.includes("average_mode")

  return (
    <div className="px-4 pb-6 pt-4 md:px-[72px] md:pb-[64px] md:pt-[40px]">
      <MeasurementStageHeader title="Thêm số đo bằng thiết bị" onClose={onClose} />

      <div className="mt-6 md:mt-10">
        <h3 className="text-center text-[22px] font-semibold leading-tight text-[#151A1E] md:text-[27px]">
          {device.displayName}
        </h3>

        <div className="mt-6 grid gap-6 md:mt-[34px] md:gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="order-2 pt-0 lg:order-1 md:pt-4">
            <ol className="list-decimal space-y-2.5 pl-6 text-[16px] font-medium leading-7 text-[#454E57] marker:font-semibold marker:text-[#454E57] md:space-y-3 md:pl-9 md:text-[22px] md:leading-[1.38]">
              {device.setupInstructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ol>

            {showAverageMode ? (
              <label className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:pr-4 md:mt-8">
                <div className="flex items-center gap-3">
                  <span className="text-[16px] font-medium text-[#151A1E] md:text-[22px]">
                    Chế độ đo trung bình
                  </span>
                  <InfoIcon className="size-5 text-[#151A1E]" />
                </div>

                <span className="relative inline-flex">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    {...register("averageMode")}
                  />
                  <span className="h-[34px] w-[64px] rounded-full bg-[#D1EDF5] transition peer-checked:bg-[#25A5C3]" />
                  <span className="absolute left-[5px] top-[5px] h-6 w-6 rounded-full bg-white shadow-sm transition peer-checked:left-[35px]" />
                </span>
              </label>
            ) : null}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between md:mt-10">
              <button
                type="button"
                onClick={onBack}
                className="text-left text-[16px] font-semibold text-[#4B5963] transition hover:text-[#0F8097] md:text-[18px]"
              >
                Quay lại danh sách thiết bị
              </button>
              <PopupButton
                onClick={onStartConnect}
                className="!min-w-0 !w-full !rounded-full !bg-[#126F81] !px-6 !py-3.5 !text-[16px] !font-semibold !shadow-none sm:!w-auto md:!min-w-[186px] md:!px-8 md:!py-4 md:!text-[18px]"
              >
                Bắt đầu kết nối
              </PopupButton>
            </div>
          </div>

          <div className="order-1 overflow-hidden rounded-[22px] md:rounded-[28px] lg:order-2">
            <div className="relative h-full min-h-[240px] w-full md:min-h-[320px]">
              <Image
                src={device.setupPanelImageSrc}
                alt={device.displayName}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
