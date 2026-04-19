/**
 * Ported 1:1 from ysalus-source/.../ManualMetricSelectionStage.tsx
 * i18n keys inlined in Vietnamese.
 */

"use client"

import { useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { MetricType } from "../ysalus-metrics/types"
import { EntryModeHeader } from "./EntryModeHeader"
import { PopupButton } from "./PopupButton"
import {
  getDefaultUnitForManualMetric,
  manualMetricDefinitions,
} from "./manualConfig"
import type {
  ManualMetricType,
  MeasurementContextFormValues,
  PopupMode,
} from "./types"

interface Props {
  isSavePending: boolean
  onClose: () => void
  onModeChange: (mode: PopupMode) => void
  onReview: () => void
  onSelectMetric: (metricType: ManualMetricType) => void
  selectedMetric: ManualMetricType | null
}

const getErrorMessage = (error: unknown) => {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return null
  }

  return typeof (error as { message?: unknown }).message === "string"
    ? ((error as { message: string }).message)
    : null
}

const resolveManualValueField = (
  metricType: ManualMetricType | null,
): keyof MeasurementContextFormValues | null => {
  switch (metricType) {
    case MetricType.BloodSugar:
      return "bloodSugarValue"
    case MetricType.Cholesterol:
      return "cholesterolValue"
    case MetricType.HeartRate:
      return "heartRateValue"
    case MetricType.Hematocrit:
      return "hematocritValue"
    case MetricType.Hemoglobin:
      return "hemoglobinValue"
    case MetricType.Ketone:
      return "ketoneValue"
    case MetricType.UricAcid:
      return "uricAcidValue"
    default:
      return null
  }
}

export const ManualMetricSelectionStage = ({
  isSavePending,
  onClose,
  onModeChange,
  onReview,
  onSelectMetric,
  selectedMetric,
}: Props) => {
  const { formState, register } =
    useFormContext<MeasurementContextFormValues>()
  const valueFieldName = resolveManualValueField(selectedMetric)
  const staticUnit = useMemo(
    () => (selectedMetric ? getDefaultUnitForManualMetric(selectedMetric) : ""),
    [selectedMetric],
  )

  return (
    <div className="px-4 pb-5 pt-4 md:px-[56px] md:pb-[48px] md:pt-[32px]">
      <EntryModeHeader
        activeMode="manual"
        onClose={onClose}
        onModeChange={onModeChange}
      />

      <section className="mt-6 md:mt-8">
        <label className="mb-3 block text-[18px] font-semibold text-[#151A1E] md:text-[20px]">
          Chọn chỉ số cần đo
          <span className="ml-1 text-[#E05666]">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedMetric ?? ""}
            onChange={(event) =>
              onSelectMetric(event.target.value as ManualMetricType)
            }
            className="h-14 w-full appearance-none rounded-[16px] border border-[#D8EAF0] bg-white px-5 pr-12 text-[16px] font-medium text-[#1A1D21] shadow-[0_4px_10px_rgba(18,129,151,0.06)] outline-hidden md:h-[62px] md:text-[17px]"
          >
            <option value="" disabled>
              Chọn chỉ số
            </option>
            {manualMetricDefinitions.map((metric) => (
              <option key={metric.type} value={metric.type}>
                {metric.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[20px] text-[#667085]">
            ˅
          </span>
        </div>

        {selectedMetric ? (
          <section className="mt-8">
            <div className="mb-5 flex items-center gap-4">
              <h3 className="shrink-0 text-[18px] font-semibold text-[#151A1E] md:text-[20px]">
                Chi tiết chỉ số
              </h3>
              <div className="h-px flex-1 bg-[#D8EAF0]" />
            </div>

            {selectedMetric === MetricType.BloodPressure ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[15px] font-semibold text-[#151A1E]">
                    Tâm thu
                    <span className="ml-1 text-[#E05666]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      {...register("systolicValue")}
                      className="h-14 w-full rounded-[16px] border border-[#D8EAF0] bg-white px-4 pr-20 text-[16px] font-medium text-[#1A1D21] shadow-[0_4px_10px_rgba(18,129,151,0.06)] outline-hidden"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[16px] text-[#98A2B3]">
                      mmHg
                    </span>
                  </div>
                  {getErrorMessage(formState.errors.systolicValue) ? (
                    <p className="mt-2 text-sm text-red-500">
                      {getErrorMessage(formState.errors.systolicValue)}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-[15px] font-semibold text-[#151A1E]">
                    Tâm trương (mmHg)
                    <span className="ml-1 text-[#E05666]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      {...register("diastolicValue")}
                      className="h-14 w-full rounded-[16px] border border-[#D8EAF0] bg-white px-4 pr-20 text-[16px] font-medium text-[#1A1D21] shadow-[0_4px_10px_rgba(18,129,151,0.06)] outline-hidden"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[16px] text-[#98A2B3]">
                      mmHg
                    </span>
                  </div>
                  {getErrorMessage(formState.errors.diastolicValue) ? (
                    <p className="mt-2 text-sm text-red-500">
                      {getErrorMessage(formState.errors.diastolicValue)}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                {selectedMetric === MetricType.BloodSugar ? (
                  <div className="mb-4">
                    <label className="mb-2 block text-[15px] font-semibold text-[#151A1E]">
                      Loại đo đường huyết
                      <span className="ml-1 text-[#E05666]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        {...register("measurement")}
                        className="h-14 w-full appearance-none rounded-[16px] border border-[#D8EAF0] bg-white px-4 pr-12 text-[16px] font-medium text-[#1A1D21] shadow-[0_4px_10px_rgba(18,129,151,0.06)] outline-hidden"
                      >
                        <option value="BLOOD_GLUCOSE">Đường huyết tiêu chuẩn</option>
                      </select>
                      <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[20px] text-[#667085]">
                        ˅
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[15px] font-semibold text-[#151A1E]">
                      Giá trị
                      <span className="ml-1 text-[#E05666]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        {...(valueFieldName ? register(valueFieldName) : {})}
                        className="h-14 w-full rounded-[16px] border border-[#D8EAF0] bg-white px-4 pr-20 text-[16px] font-medium text-[#1A1D21] shadow-[0_4px_10px_rgba(18,129,151,0.06)] outline-hidden"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[16px] text-[#98A2B3]">
                        {staticUnit}
                      </span>
                    </div>
                    {valueFieldName && getErrorMessage(formState.errors[valueFieldName]) ? (
                      <p className="mt-2 text-sm text-red-500">
                        {getErrorMessage(formState.errors[valueFieldName])}
                      </p>
                    ) : null}
                  </div>

                  {selectedMetric === MetricType.BloodSugar ? (
                    <div>
                      <label className="mb-2 block text-[15px] font-semibold text-[#151A1E]">
                        Thời điểm đo
                        <span className="ml-1 text-[#E05666]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          {...register("meal")}
                          className="h-14 w-full appearance-none rounded-[16px] border border-[#D8EAF0] bg-white px-4 pr-12 text-[16px] font-medium text-[#1A1D21] shadow-[0_4px_10px_rgba(18,129,151,0.06)] outline-hidden"
                        >
                          <option value="BEFORE_MEAL">Trước ăn</option>
                          <option value="AFTER_MEAL">Sau ăn</option>
                          <option value="FASTING">Lúc đói</option>
                        </select>
                        <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[20px] text-[#667085]">
                          ˅
                        </span>
                      </div>
                      {getErrorMessage(formState.errors.meal) ? (
                        <p className="mt-2 text-sm text-red-500">
                          {getErrorMessage(formState.errors.meal)}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </>
            )}

            <div className="mt-5">
              <label className="mb-2 block text-[15px] font-semibold text-[#151A1E]">
                Chọn thời gian
                <span className="ml-1 text-[#E05666]">*</span>
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="date"
                  {...register("takenAtDate")}
                  className="h-14 w-full rounded-[16px] border border-[#D8EAF0] bg-white px-4 text-[16px] font-medium text-[#1A1D21] shadow-[0_4px_10px_rgba(18,129,151,0.06)] outline-hidden"
                />
                <input
                  type="time"
                  {...register("takenAtTime")}
                  className="h-14 w-full rounded-[16px] border border-[#D8EAF0] bg-white px-4 text-[16px] font-medium text-[#1A1D21] shadow-[0_4px_10px_rgba(18,129,151,0.06)] outline-hidden"
                />
              </div>
              {getErrorMessage(formState.errors.takenAtDate) ? (
                <p className="mt-2 text-sm text-red-500">
                  {getErrorMessage(formState.errors.takenAtDate)}
                </p>
              ) : null}
              {getErrorMessage(formState.errors.takenAtTime) ? (
                <p className="mt-2 text-sm text-red-500">
                  {getErrorMessage(formState.errors.takenAtTime)}
                </p>
              ) : null}
              {getErrorMessage(formState.errors.root) ? (
                <p className="mt-2 text-sm text-red-500">
                  {getErrorMessage(formState.errors.root)}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        <div className="mt-10 flex justify-center">
          <PopupButton
            type="button"
            onClick={onReview}
            loading={isSavePending}
            disabled={!selectedMetric}
            className="!min-w-[250px] !rounded-full !bg-[#126F81] !px-8 !py-4 !text-[17px] !font-semibold !shadow-none disabled:!bg-[#D9D9D9] md:!min-w-[300px]"
          >
            Thêm số đo
          </PopupButton>
        </div>
      </section>
    </div>
  )
}
