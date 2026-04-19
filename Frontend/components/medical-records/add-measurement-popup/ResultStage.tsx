/**
 * Ported 1:1 from ysalus-source/.../ResultStage.tsx
 * i18n keys inlined in Vietnamese. `statusKey`/`labelKey`/`badgeKey` i18n
 * lookups in ysalus are replaced with already-translated string fields on
 * NormalizedMeasurement (statusLabel / metrics[].label / metrics[].badgeLabel).
 * Recommendation copy is already inlined VN in config.ts.
 */

"use client"

import { useEffect } from "react"
import { useFormContext } from "react-hook-form"
import {
  BloodPressureFilledIcon,
  ChartMetricIcon,
  CloseIcon,
  HeartRateIcon,
} from "../ysalus-metrics/icons"
import { MetricType } from "../ysalus-metrics/types"
import { PopupButton } from "./PopupButton"
import type {
  MeasurementContextFormValues,
  NormalizedMeasurement,
  RecommendationTab,
  SubjectOption,
} from "./types"

interface Props {
  activeTab: RecommendationTab
  isReminderPending: boolean
  isSavePending: boolean
  onBookAppointment: () => void
  onClose: () => void
  onSetReminder: () => void
  onSwitchTab: (tab: RecommendationTab) => void
  onSave: () => void
  result: NormalizedMeasurement
  showMealField: boolean
  subject: SubjectOption | null
}

const metricIconMap = {
  bloodPressure: BloodPressureFilledIcon,
  heartRate: HeartRateIcon,
  default: ChartMetricIcon,
} as const

/**
 * Pill style for result badges. Mirrors the chart/card colours so a single
 * mental model holds across the feature: NORMAL = green, LOW/HIGH = red.
 */
const RESULT_BADGE_STYLE: Record<"low" | "normal" | "high", string> = {
  low: "bg-rose-500 text-white",
  normal: "bg-emerald-500 text-white",
  high: "bg-rose-500 text-white",
}

export const ResultStage = ({
  activeTab,
  isReminderPending,
  isSavePending,
  onBookAppointment,
  onClose,
  onSave,
  onSetReminder,
  onSwitchTab,
  result,
  showMealField,
  subject,
}: Props) => {
  const { formState, register } =
    useFormContext<MeasurementContextFormValues>()

  useEffect(() => {
    console.debug("[AddMeasurementPopup][ResultStage] render", result)
  }, [result])

  const themeClasses =
    result.tone === "danger"
      ? {
          banner: "border-[#FF94A3] bg-white",
          card: "border-[#FF9AAA] bg-[#FFF2F5]",
        }
      : {
          banner: "border-[#CFEAF2] bg-white",
          card: "border-[#CFEAF2] bg-[#E8F7FC]",
        }
  return (
    <div className="px-4 pb-4 pt-4 md:px-[44px] md:pb-[44px] md:pt-[32px]">
      <div className="-mx-4 sticky top-0 z-10 flex items-start justify-between border-b border-[#D8ECF1] bg-white px-4 pb-4 pt-4 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0">
        <h2 className="text-[18px] font-semibold text-[#151A1E] md:text-[22px]">
          Kết quả theo dõi
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

      <section
        className={`mt-5 rounded-[18px] border px-4 py-4 md:mt-6 md:px-5 ${themeClasses.banner} !hidden`}
      >
        <div className="flex items-start gap-3 md:items-center md:gap-4">
          <div className="flex size-[44px] items-center justify-center rounded-full bg-[#E8F7FC] text-[24px] md:size-[54px] md:text-[28px]">
            {result.tone === "danger" ? "😟" : "😌"}
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[#151A1E] md:text-[18px]">
              {result.statusLabel}
            </p>
            <p className="mt-1 text-[12px] font-medium text-[#667085] md:text-[13px]">
              {result.takenAt}
            </p>
          </div>
        </div>
      </section>

      <section
        className={`mt-5 rounded-[20px] border px-4 py-4 md:mt-7 md:rounded-[22px] md:px-5 ${themeClasses.card}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold ${
              subject?.avatarClassName ?? "bg-[#DCEEFF] text-[#2A80D8]"
            }`}
          >
            {subject?.initials ?? "PL"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold text-[#25292D]">
              {subject?.name ?? "Pham Linh"}
            </p>
            <p className="mt-1 truncate text-[13px] text-[#86909A]">
              {subject?.readableId ?? "ID1234"} •{" "}
              {subject?.programLabel ?? "Theo dõi tim mạch"}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-[#C9DFE5] pt-5">
          <div className="space-y-5 md:space-y-6">
            {result.metrics.map((metric) => {
              const Icon =
                metric.type === MetricType.BloodPressure
                  ? metricIconMap.bloodPressure
                  : metric.type === MetricType.HeartRate
                    ? metricIconMap.heartRate
                    : metricIconMap.default

              return (
                <div
                  key={metric.id}
                  className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 items-center justify-center rounded-[10px] bg-white text-[#19A1BD]">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[15px] font-semibold text-[#25292D] md:text-[16px]">
                          {metric.label}
                        </p>
                        {metric.badgeLabel ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              metric.badgeKey
                                ? RESULT_BADGE_STYLE[metric.badgeKey]
                                : "bg-[#FFF0C7] text-[#C78A11]"
                            }`}
                          >
                            {metric.badgeLabel}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[15px] font-semibold text-[#25292D] md:text-[16px]">
                        {metric.value}
                      </p>
                    </div>
                  </div>
                  {metric.rangeLabel ? (
                    <p className="pt-1 text-left text-[13px] font-medium text-[#5A6671] sm:text-right">
                      Ngưỡng bình thường: {metric.rangeLabel}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {showMealField ? (
        <div className="mt-5 md:mt-7">
          <label className="mb-2 block text-[16px] font-semibold text-[#151A1E] md:text-[18px]">
            Thời điểm ăn
          </label>
          <select
            {...register("meal")}
            className="h-12 w-full rounded-[12px] border border-[#CFE7EF] px-4 text-[16px] font-medium text-[#1A1D21] outline-hidden md:h-[56px] md:text-[17px]"
          >
            <option value="AFTER_MEAL">Sau ăn</option>
            <option value="BEFORE_MEAL">Trước ăn</option>
            <option value="FASTING">Lúc đói</option>
          </select>
        </div>
      ) : null}

      <div className="mt-5 md:mt-6">
        <label className="mb-2 block text-[16px] font-semibold text-[#151A1E] md:text-[18px]">
          Ghi chú
        </label>
        <textarea
          rows={3}
          {...register("notes")}
          className="min-h-[82px] w-full rounded-[12px] border border-[#CFE7EF] px-4 py-3 text-[16px] text-[#1A1D21] outline-hidden"
        />
        {formState.errors.notes?.message ? (
          <p className="mt-2 text-sm text-red-500">
            {formState.errors.notes.message}
          </p>
        ) : null}
      </div>

      <div className="mt-7 border-b border-[#D8ECF1] md:mt-8">
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div className="flex w-max min-w-full items-center gap-5 md:gap-8">
            {(["info", "nutrition"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`relative whitespace-nowrap pb-3 text-[16px] font-semibold md:text-[18px] ${
                  activeTab === tab ? "text-[#137B90]" : "text-[#1B1F23]"
                }`}
                onClick={() => onSwitchTab(tab)}
              >
                {tab === "info" ? "Thông tin tham khảo" : "Khuyến nghị dinh dưỡng"}
                {activeTab === tab ? (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#137B90]" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 min-h-[100px] md:mt-6">
        {result.recommendation.note ? (
          <p className="mb-3 text-[14px] font-semibold text-[#D6455D] md:text-[15px]">
            {result.recommendation.note}
          </p>
        ) : null}
        <p className="text-[14px] leading-7 text-[#475467] md:text-[15px] md:leading-8">
          {activeTab === "info"
            ? result.recommendation.info
            : result.recommendation.nutrition}
        </p>
        {result.recommendation.followUp ? (
          <p className="mt-4 text-[14px] font-medium text-[#475467] md:mt-5 md:text-[15px]">
            {result.recommendation.followUp}
          </p>
        ) : null}
      </div>

      <div className="-mx-4 sticky bottom-0 z-10 mt-6 border-t border-[#D8ECF1] bg-white/95 px-4 py-4 backdrop-blur md:static md:mx-0 md:mt-8 md:border-0 md:bg-transparent md:px-0 md:py-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {result.actions.canSave ? (
            <PopupButton
              onClick={onSave}
              loading={isSavePending}
              className="!w-full !min-w-0 !rounded-full !bg-[#126F81] !px-6 !py-3.5 !text-[16px] !font-semibold !shadow-none sm:!w-auto md:!min-w-[210px] md:!px-8 md:!py-4 md:!text-[18px]"
            >
              Lưu
            </PopupButton>
          ) : null}
          {result.actions.canBookAppointment ? (
            <PopupButton
              onClick={onBookAppointment}
              className="!w-full !min-w-0 !rounded-full !bg-[#126F81] !px-6 !py-3.5 !text-[16px] !font-semibold !shadow-none sm:!w-auto md:!min-w-[210px] md:!px-8 md:!py-4 md:!text-[18px]"
            >
              Đặt lịch hẹn
            </PopupButton>
          ) : null}
          {result.actions.canSetReminder ? (
            <PopupButton
              variant="outline"
              onClick={onSetReminder}
              loading={isReminderPending}
              className="!w-full !min-w-0 !rounded-full !border-[#1D89A2] !bg-[#E5F6FB] !px-6 !py-3.5 !text-[16px] !font-semibold !text-[#137B90] sm:!w-auto md:!min-w-[210px] md:!px-8 md:!py-4 md:!text-[18px]"
            >
              Đặt nhắc nhở
            </PopupButton>
          ) : null}
        </div>
      </div>
    </div>
  )
}
