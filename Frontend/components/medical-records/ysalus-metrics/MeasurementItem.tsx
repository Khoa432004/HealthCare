"use client"

import { type JSX, useEffect, useState } from "react"
import { Activity } from "lucide-react"

import { Badge } from "@/components/ui/badge"

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
import { MetricType, type MetricDetail } from "./types"

interface Props {
  metricDetail: MetricDetail
  status?: "low" | "normal" | "upper" | "high"
  className?: string
}

const STATUS_LABEL: Record<
  NonNullable<Props["status"]>,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  low: { label: "Thấp", variant: "secondary" },
  normal: { label: "Bình thường", variant: "default" },
  upper: { label: "Tiền cao", variant: "outline" },
  high: { label: "Cao", variant: "destructive" },
}

const SOURCE_LABEL: Record<string, string> = {
  manual: "Nhập tay",
  device: "Thiết bị",
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

  const statusInfo = status ? STATUS_LABEL[status] : undefined

  return (
    <div
      className={`w-full flex flex-col bg-brand-05 p-4 rounded-2xl gap-2 ${className}`}
    >
      <div className="flex items-start justify-between">
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
        {statusInfo && (
          <Badge variant={statusInfo.variant} className="capitalize">
            {statusInfo.label}
          </Badge>
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
