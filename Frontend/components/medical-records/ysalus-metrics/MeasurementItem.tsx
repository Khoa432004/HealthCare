"use client"

import { type JSX, useEffect, useState } from "react"
import { Activity, Utensils } from "lucide-react"

import {
  BloodPressureFilledIcon,
  EditIcon,
  HeartRateIcon,
  HeightFilledIcon,
  MobileIcon,
  MoleculeFilledIcon,
  TestTubeFilledIcon,
  TimeIcon,
  WaterMineralFilledIcon,
  WeightFilledIcon,
} from "./icons"
import { MetricType, MetricTimeOfDay, type MetricDetail } from "./types"

type BadgeStatus = "LOW" | "NORMAL" | "HIGH"

interface Props {
  metricDetail: MetricDetail
  /** Optional override. When omitted, uses `metricDetail.badge` from the backend. */
  status?: BadgeStatus | "low" | "normal" | "high" | "upper"
  className?: string
}

const BADGE_STYLE: Record<BadgeStatus, { label: string; className: string }> = {
  // LOW + HIGH share the same red treatment so the entire UI conveys
  // "abnormal = đỏ" consistently (chart dots, card background, badge).
  LOW: {
    label: "Low",
    className: "bg-rose-500 text-white",
  },
  NORMAL: {
    label: "Normal",
    className: "bg-emerald-500 text-white",
  },
  HIGH: {
    label: "High",
    className: "bg-rose-500 text-white",
  },
}

const MEAL_LABEL: Record<string, string> = {
  [MetricTimeOfDay.BeforeMeal]: "Before meal",
  [MetricTimeOfDay.AfterMeal]: "After meal",
  [MetricTimeOfDay.Fasting]: "Fasting",
}

const SOURCE_LABEL: Record<string, string> = {
  manual: "Nhập tay",
  device: "Thiết bị",
}

function normalizeBadge(
  raw: Props["status"] | null | undefined
): BadgeStatus | null {
  if (!raw) return null
  const upper = String(raw).toUpperCase()
  if (upper === "LOW" || upper === "NORMAL" || upper === "HIGH") {
    return upper as BadgeStatus
  }
  // Legacy aliases (Vietnamese labels / ysalus "upper" tier).
  if (upper === "UPPER") return "HIGH"
  return null
}

export const MeasurementItem = ({
  metricDetail,
  status,
  className = "",
}: Props) => {
  const [label, setLabel] = useState<string | undefined>()
  const [time, setTime] = useState<string | undefined>()
  const [method, setMethod] = useState<string | undefined>()
  const [icon, setIcon] = useState<JSX.Element | undefined>()
  const [valueUnit, setValueUnit] = useState<string | undefined>()
  const [value, setValue] = useState<number | string | undefined>()

  const [secondaryIcon, setSecondaryIcon] = useState<JSX.Element | undefined>()
  const [secondaryLabel, setSecondaryLabel] = useState<string | undefined>()
  const [secondaryValue, setSecondaryValue] = useState<
    number | string | undefined
  >()
  const [secondaryValueUnit, setSecondaryValueUnit] = useState<
    string | undefined
  >()

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  useEffect(() => {
    setSecondaryIcon(undefined)
    setSecondaryLabel(undefined)
    setSecondaryValue(undefined)
    setSecondaryValueUnit(undefined)

    const defaultIcon = <WeightFilledIcon className="size-6 text-brand-6" />
    const iconMap: Partial<Record<MetricType, JSX.Element>> = {
      [MetricType.Measurement]: defaultIcon,
      [MetricType.BloodSugar]: (
        <WaterMineralFilledIcon className="size-6 text-brand-6" />
      ),
      [MetricType.Hematocrit]: (
        <TestTubeFilledIcon className="size-6 text-brand-6" />
      ),
      [MetricType.Ketone]: (
        <MoleculeFilledIcon className="size-6 text-brand-6" />
      ),
      [MetricType.BloodPressure]: (
        <BloodPressureFilledIcon className="size-6 text-brand-6" />
      ),
      [MetricType.HeartRate]: <HeartRateIcon className="size-6 text-brand-6" />,
      [MetricType.Ecg]: <Activity className="size-6 text-brand-6" />,
    }

    setIcon(iconMap[metricDetail.type] ?? defaultIcon)
    setTime(
      formatTime(
        metricDetail.takenAt ?? metricDetail.updatedAt ?? new Date()
      )
    )
    setMethod(metricDetail.source ?? undefined)

    switch (metricDetail.type) {
      case MetricType.Hemoglobin:
        setLabel("Hemoglobin")
        setValueUnit("g/L")
        setValue(metricDetail.value ?? undefined)
        break
      case MetricType.UricAcid:
        setLabel("Axit uric")
        setValueUnit("mg/dL")
        setValue(metricDetail.value ?? undefined)
        break
      case MetricType.HeartRate:
        setLabel("Nhịp tim")
        setValueUnit("BPM")
        setValue(metricDetail.value ?? undefined)
        break
      case MetricType.Ecg:
        setLabel("ECG")
        setValueUnit("BPM")
        setValue(
          `${metricDetail.kardiaHeartRate ?? "--"} BPM / ${
            metricDetail.kardiaDuration ?? "--"
          }s`
        )
        break
      case MetricType.Cholesterol:
        setLabel("Cholesterol")
        setValueUnit("mg/dL")
        setValue(metricDetail.value ?? undefined)
        break
      case MetricType.Measurement: {
        const hasHeight =
          metricDetail.height !== undefined && metricDetail.height !== null
        const hasWeight =
          metricDetail.weight !== undefined && metricDetail.weight !== null

        if (hasHeight && hasWeight) {
          setIcon(<HeightFilledIcon className="size-6 text-brand-6" />)
          setLabel("Chiều cao")
          setValueUnit("cm")
          setValue(metricDetail.height ?? undefined)
          setSecondaryIcon(
            <WeightFilledIcon className="size-6 text-brand-6" />
          )
          setSecondaryLabel("Cân nặng")
          setSecondaryValueUnit("kg")
          setSecondaryValue(metricDetail.weight ?? undefined)
          break
        }

        if (hasHeight) {
          setIcon(<HeightFilledIcon className="size-6 text-brand-6" />)
          setLabel("Chiều cao")
          setValueUnit("cm")
          setValue(metricDetail.height ?? undefined)
          break
        }

        setIcon(<WeightFilledIcon className="size-6 text-brand-6" />)
        setLabel("Cân nặng")
        setValueUnit("kg")
        setValue(metricDetail.weight ?? undefined)
        break
      }
      case MetricType.BloodSugar:
        setLabel("Đường huyết")
        setValueUnit("mg/dL")
        setValue(metricDetail.value ?? undefined)
        break
      case MetricType.Hematocrit:
        setLabel("Hematocrit")
        setValueUnit("%")
        setValue(metricDetail.value ?? undefined)
        break
      case MetricType.Ketone:
        setLabel("Ketone")
        setValueUnit("mmol/L")
        setValue(metricDetail.value ?? undefined)
        break
      case MetricType.BloodPressure:
        setLabel("Huyết áp")
        setValueUnit("mmHg")
        setValue(
          `${metricDetail.systolicValue ?? "--"}/${
            metricDetail.diastolicValue ?? "--"
          }`
        )
        if (
          metricDetail.pulseValue !== undefined &&
          metricDetail.pulseValue !== null
        ) {
          setSecondaryIcon(
            <HeartRateIcon className="size-6 text-brand-6" />
          )
          setSecondaryLabel("Nhịp tim")
          setSecondaryValueUnit("BPM")
          setSecondaryValue(metricDetail.pulseValue)
        }
        break
      default:
        break
    }
  }, [metricDetail])

  const badge = normalizeBadge(status) ?? normalizeBadge(metricDetail.badge)
  const badgeInfo = badge ? BADGE_STYLE[badge] : undefined

  const mealKey =
    typeof metricDetail.timeOfDay === "string" ? metricDetail.timeOfDay : undefined
  const mealLabel = mealKey ? MEAL_LABEL[mealKey] : undefined

  const cardBackground =
    badge === "LOW" || badge === "HIGH" ? "bg-rose-50" : "bg-brand-05"

  return (
    <div
      className={`w-full flex flex-col ${cardBackground} p-4 rounded-2xl gap-2 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-xl p-3">{icon}</div>
            <div>
              <span className="text-sm text-gray-900 font-semibold">
                {label}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-gray-900">{value}</span>
                <span className="text-sm text-gray-500">{valueUnit}</span>
              </div>
            </div>
          </div>
          {secondaryLabel &&
            secondaryValue !== undefined &&
            secondaryValue !== null && (
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-xl p-3">{secondaryIcon}</div>
                <div>
                  <span className="text-sm text-gray-900 font-semibold">
                    {secondaryLabel}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-gray-900">
                      {secondaryValue}
                    </span>
                    <span className="text-sm text-gray-500">
                      {secondaryValueUnit}
                    </span>
                  </div>
                </div>
              </div>
            )}
        </div>
        {(badgeInfo || mealLabel) && (
          <div className="flex flex-col items-end gap-1 shrink-0">
            {badgeInfo && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeInfo.className}`}
              >
                {badgeInfo.label}
              </span>
            )}
            {mealLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-6 px-2.5 py-0.5 text-xs font-semibold text-white">
                <Utensils className="size-3" />
                {mealLabel}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <TimeIcon className="size-4" />
        <span className="mr-4">{time}</span>
        {method === "manual" ? (
          <EditIcon className="size-4" />
        ) : (
          <MobileIcon className="size-4" />
        )}
        <span>{method ? SOURCE_LABEL[method] ?? method : ""}</span>
      </div>
    </div>
  )
}
