/**
 * Ported from ysalus-source/.../add-measurement-popup/config.ts
 *
 * Differences from ysalus:
 * - We only ship the manual-measurement builder because HealthCare doesn't
 *   carry the FORA Bluetooth SDK. The device flow will short-circuit into a
 *   "coming soon" FailureStage before reaching the realtime builder.
 * - i18n keys are replaced with inline Vietnamese labels.
 * - Recommendation copy is inlined in Vietnamese (ysalus pulled it from
 *   translation.json).
 */

import { format } from "date-fns"

import {
  MetricBloodSugarMeasurement,
  MetricCholesterolMeasurement,
  MetricTimeOfDay,
  MetricType,
} from "../ysalus-metrics/types"
import type {
  DeviceDefinition,
  DeviceError,
  DeviceId,
  ManualMetricType,
  MeasurementContextFormValues,
  MeasurementFamily,
  MetricResult,
  NormalizedMeasurement,
  SeverityLevel,
  UIState,
} from "./types"

export const measurementEntryModes = ["manual", "device"] as const

export const defaultMeasurementContextValues: MeasurementContextFormValues = {
  entryMode: "manual",
  profileId: "",
  averageMode: false,
  manualMetricType: null,
  takenAtDate: format(new Date(), "yyyy-MM-dd"),
  takenAtTime: format(new Date(), "HH:mm"),
  systolicValue: "",
  diastolicValue: "",
  pulseValue: "",
  bloodSugarValue: "",
  cholesterolValue: "",
  heartRateValue: "",
  hematocritValue: "",
  hemoglobinValue: "",
  ketoneValue: "",
  uricAcidValue: "",
  unit: "mg/dL",
  measurement: MetricBloodSugarMeasurement.BloodGlucose,
  meal: MetricTimeOfDay.AfterMeal,
  notes: "",
}

export const deviceCatalog: Record<DeviceId, DeviceDefinition> = {
  "6connect": {
    id: "6connect",
    displayName: "FORA® 6 Connect",
    bleNamePrefix: "FORA 6 CONNECT",
    thumbnailSrc: "/images/device2.png",
    setupPanelImageSrc: "/images/device-popup/fora6-setup-panel.png",
    serialNumber: "13oi3289491274",
    latestExaminationAt: "12/04, 07:03",
    capabilities: ["meal_context", "blood_glucose", "uric_acid", "lipid_panel"],
    setupInstructions: [
      "Đặt điện thoại gần thiết bị đo.",
      "Tắt các ứng dụng đồng bộ khác để tránh xung đột kết nối.",
      "Bật Bluetooth trên điện thoại và thiết bị đo.",
      "Nhấn nút Bluetooth trên thiết bị để bật chế độ ghép nối.",
      "Chạm nút “Bắt đầu kết nối” để tiến hành đo.",
    ],
  },
  p80: {
    id: "p80",
    displayName: "FORA® Diamond Cuff BP (P80)",
    bleNamePrefix: "DIAMOND CUFF BP",
    thumbnailSrc: "/images/device4.png",
    setupPanelImageSrc: "/images/device-popup/p80-setup-panel.png",
    serialNumber: "13oi3289491274",
    latestExaminationAt: "12/04, 07:03",
    capabilities: ["average_mode", "blood_pressure", "heart_rate"],
    setupInstructions: [
      "Đặt điện thoại gần thiết bị đo.",
      "Tắt các ứng dụng đồng bộ khác để tránh xung đột kết nối.",
      "Bật Bluetooth trên điện thoại và thiết bị đo.",
      "Nhấn nút Bluetooth trên thiết bị để bật chế độ ghép nối.",
      "Chạm nút “Bắt đầu kết nối” để tiến hành đo.",
    ],
  },
}

export const defaultRegisteredDeviceIds: DeviceId[] = ["6connect", "p80"]

export const initialAddMeasurementState: UIState = {
  view: "closed",
  mode: "manual",
  deviceId: null,
  registeredDeviceIds: defaultRegisteredDeviceIds,
  recommendationTab: "info",
  countdownSeconds: 40,
  discoveredDeviceName: null,
  error: null,
  result: null,
  manualMetricType: null,
}

const VIETNAMESE_WEEKDAYS = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
]

const createMeasurementTimestamp = (value: Date | string) => {
  const date = new Date(value)
  const weekday = VIETNAMESE_WEEKDAYS[date.getDay()] ?? ""
  return `${weekday}, ${format(date, "d 'tháng' M yyyy, HH:mm")}`
}

const HEART_RATE_RANGE = {
  min: 60,
  max: 100,
} as const

const BLOOD_GLUCOSE_RANGE_MGDL = {
  min: 70,
  max: 140,
} as const

const URIC_ACID_RANGE_MGDL = {
  min: 3.5,
  max: 7.2,
} as const

const TOTAL_CHOLESTEROL_MAX_MGDL = 200
const TRIGLYCERIDES_MAX_MGDL = 150
const HDL_MIN_MGDL = 40
const LDL_MAX_MGDL = 100

const BADGE_LABEL: Record<"low" | "normal" | "high", string> = {
  low: "Thấp",
  normal: "Bình thường",
  high: "Cao",
}

type MetricBadge = "low" | "normal" | "high"

const severityRank: Record<SeverityLevel, number> = {
  lv1: 1,
  lv2: 2,
  lv3: 3,
  lv4: 4,
  lv5: 5,
  lv6: 6,
}

const badgeFromSeverity = (severity: SeverityLevel): MetricBadge =>
  severity === "lv1" ? "low" : severity === "lv2" ? "normal" : "high"

const badgeLabelFromSeverity = (severity: SeverityLevel) =>
  BADGE_LABEL[badgeFromSeverity(severity)]

const formatMetricValue = (value: number, unit: string) => `${value} ${unit}`

const parseManualNumber = (value: string) => Number(value.trim())

const createManualMeasurementDate = (
  formValues: MeasurementContextFormValues
) =>
  new Date(
    `${formValues.takenAtDate.trim()}T${formValues.takenAtTime.trim()}:00`
  )

const resolveBloodPressureRangeLabel = () => "90-120/60-80 mmHg"

const resolveBloodGlucoseRangeLabel = (unit: string) =>
  unit === "mmol/L" ? "3.9-7.8 mmol/L" : "70-140 mg/dL"

interface BloodPressureRecord {
  systolic: number
  diastolic: number
  pulse?: number
  unit: "mmHg"
}

const resolveP80Severity = (record: BloodPressureRecord): SeverityLevel => {
  const { systolic, diastolic, pulse } = record

  if (systolic >= 160 || diastolic >= 100) return "lv6"
  if (systolic >= 140 || diastolic >= 90) return "lv5"
  if (systolic >= 130 || diastolic >= 80) return "lv4"
  if (systolic >= 120 || (pulse !== undefined && pulse > HEART_RATE_RANGE.max))
    return "lv3"
  if (
    systolic < 90 ||
    diastolic < 60 ||
    (pulse !== undefined && pulse < HEART_RATE_RANGE.min)
  )
    return "lv1"

  return "lv2"
}

const resolveBloodGlucoseSeverity = (
  valueMgDl: number,
  meal: MetricTimeOfDay | null
): SeverityLevel => {
  const isAfterMeal = meal === MetricTimeOfDay.AfterMeal
  const normalMax = isAfterMeal ? 140 : 99

  if (valueMgDl < BLOOD_GLUCOSE_RANGE_MGDL.min) return "lv1"
  if (valueMgDl <= normalMax) return "lv2"

  if (isAfterMeal) {
    if (valueMgDl <= 180) return "lv3"
    if (valueMgDl <= 250) return "lv4"
    if (valueMgDl <= 300) return "lv5"
    return "lv6"
  }

  if (valueMgDl <= 125) return "lv3"
  if (valueMgDl <= 180) return "lv4"
  if (valueMgDl <= 250) return "lv5"
  return "lv6"
}

const resolveUricAcidSeverity = (
  metricValue: { value: number; unit: string }
): SeverityLevel | undefined => {
  if (metricValue.unit !== "mg/dL") return undefined
  if (metricValue.value < URIC_ACID_RANGE_MGDL.min) return "lv1"
  if (metricValue.value <= URIC_ACID_RANGE_MGDL.max) return "lv2"
  if (metricValue.value <= 8.5) return "lv3"
  if (metricValue.value <= 10) return "lv4"
  if (metricValue.value <= 12) return "lv5"
  return "lv6"
}

const resolveCholesterolSeverity = (
  measurementSubType: MetricCholesterolMeasurement,
  metricValue: { value: number; unit: string }
): SeverityLevel | undefined => {
  if (metricValue.unit !== "mg/dL") return undefined

  if (measurementSubType === MetricCholesterolMeasurement.HighDensityLipoprotein) {
    return metricValue.value < HDL_MIN_MGDL ? "lv1" : "lv2"
  }

  if (measurementSubType === MetricCholesterolMeasurement.TotalCholesterol) {
    if (metricValue.value <= TOTAL_CHOLESTEROL_MAX_MGDL) return "lv2"
    if (metricValue.value <= 239) return "lv3"
    if (metricValue.value <= 279) return "lv4"
    if (metricValue.value <= 399) return "lv5"
    return "lv6"
  }

  if (measurementSubType === MetricCholesterolMeasurement.Triglycerides) {
    if (metricValue.value < TRIGLYCERIDES_MAX_MGDL) return "lv2"
    if (metricValue.value <= 199) return "lv3"
    if (metricValue.value <= 299) return "lv4"
    if (metricValue.value <= 499) return "lv5"
    return "lv6"
  }

  if (metricValue.value < LDL_MAX_MGDL) return "lv2"
  if (metricValue.value <= 129) return "lv3"
  if (metricValue.value <= 159) return "lv4"
  if (metricValue.value <= 189) return "lv5"
  return "lv6"
}

const resolveHeartRateSeverity = (heartRate: number): SeverityLevel => {
  if (heartRate < HEART_RATE_RANGE.min) return "lv1"
  if (heartRate > HEART_RATE_RANGE.max) return "lv3"
  return "lv2"
}

const BLOOD_GLUCOSE_INFO =
  "Duy trì đường huyết ổn định bằng cách ăn uống điều độ, hạn chế đồ ngọt và vận động đều đặn mỗi ngày."
const BLOOD_GLUCOSE_NUTRITION =
  "Ưu tiên rau xanh, trái cây ít ngọt, ngũ cốc nguyên hạt. Tránh nước ngọt, bánh kẹo và thực phẩm chế biến sẵn."
const BLOOD_PRESSURE_INFO =
  "Theo dõi huyết áp 2 lần/ngày và ghi lại để bác sĩ đánh giá. Giữ cân nặng hợp lý và tránh căng thẳng kéo dài."
const BLOOD_PRESSURE_NUTRITION =
  "Ăn giảm muối, tăng rau củ và cá, hạn chế đồ chiên rán, rượu bia và cà phê."
const REPEAT_IN_7_DAYS = "Đề xuất đo lại sau 7 ngày."
const REPEAT_AFTER_1_DAY = "Đề xuất đo lại sau 1 ngày để theo dõi."

const buildResultMeta = (
  deviceId: DeviceId,
  severity: SeverityLevel
): Pick<
  NormalizedMeasurement,
  "actions" | "recommendation" | "severity" | "statusLabel" | "tone"
> => {
  const isAbnormal = severity !== "lv2"
  // Any non-normal classification (LOW or any HIGH tier) is rendered as
  // "danger" (red) so the popup background and badges match the chart/cards.
  const tone: NormalizedMeasurement["tone"] = isAbnormal ? "danger" : "success"

  if (deviceId === "6connect") {
    return {
      severity,
      tone,
      statusLabel: isAbnormal ? "Chỉ số bất thường" : "Chỉ số bình thường",
      recommendation: {
        info: BLOOD_GLUCOSE_INFO,
        nutrition: BLOOD_GLUCOSE_NUTRITION,
        followUp: severity === "lv2" ? REPEAT_IN_7_DAYS : REPEAT_AFTER_1_DAY,
      },
      actions: {
        canSave: true,
        canSetReminder: true,
        canBookAppointment: false,
      },
    }
  }

  return {
    severity,
    tone,
    statusLabel: isAbnormal ? "Chỉ số bất thường" : "Chỉ số bình thường",
    recommendation: {
      info: BLOOD_PRESSURE_INFO,
      nutrition: BLOOD_PRESSURE_NUTRITION,
      followUp: severity === "lv2" ? undefined : REPEAT_IN_7_DAYS,
    },
    actions: {
      canSave: true,
      canSetReminder: true,
      canBookAppointment: false,
    },
  }
}

const resolveManualCholesterolMeasurementSubType = (
  measurement: MeasurementContextFormValues["measurement"]
) =>
  Object.values(MetricCholesterolMeasurement).includes(
    measurement as MetricCholesterolMeasurement
  )
    ? (measurement as MetricCholesterolMeasurement)
    : MetricCholesterolMeasurement.TotalCholesterol

const resolveCholesterolLabel = (
  measurementSubType: MetricCholesterolMeasurement
) =>
  measurementSubType === MetricCholesterolMeasurement.Triglycerides
    ? "Triglyceride"
    : measurementSubType === MetricCholesterolMeasurement.HighDensityLipoprotein
      ? "Cholesterol HDL"
      : measurementSubType === MetricCholesterolMeasurement.LowDensityLipoprotein
        ? "Cholesterol LDL"
        : "Cholesterol toàn phần"

export const buildMeasurementResultFromManual = (
  formValues: MeasurementContextFormValues
): NormalizedMeasurement => {
  const metricType = formValues.manualMetricType
  const takenAt = createManualMeasurementDate(formValues)

  if (!metricType) {
    throw new Error("Manual metric type is required")
  }

  if (metricType === MetricType.BloodPressure) {
    const pulse = formValues.pulseValue.trim()
      ? parseManualNumber(formValues.pulseValue)
      : undefined
    const record: BloodPressureRecord = {
      systolic: parseManualNumber(formValues.systolicValue),
      diastolic: parseManualNumber(formValues.diastolicValue),
      pulse,
      unit: "mmHg",
    }
    const severity = resolveP80Severity(record)
    const meta = buildResultMeta("p80", severity)

    const pulseBadgeKey: MetricBadge | undefined =
      pulse === undefined
        ? undefined
        : pulse < HEART_RATE_RANGE.min
          ? "low"
          : pulse > HEART_RATE_RANGE.max
            ? "high"
            : "normal"
    const pulseBadgeLabel = pulseBadgeKey ? BADGE_LABEL[pulseBadgeKey] : undefined

    return {
      ...meta,
      deviceId: null,
      family: "blood_pressure",
      takenAt: createMeasurementTimestamp(takenAt),
      metrics: [
        {
          id: "blood-pressure",
          label: "Huyết áp",
          type: MetricType.BloodPressure,
          value: `${record.systolic}/${record.diastolic} ${record.unit}`,
          badgeLabel: badgeLabelFromSeverity(severity),
          badgeKey: badgeFromSeverity(severity),
          rangeLabel: resolveBloodPressureRangeLabel(),
        },
        ...(pulse
          ? [
              {
                id: "heart-rate",
                label: "Nhịp tim",
                type: MetricType.HeartRate,
                value: `${pulse} bpm`,
                badgeLabel: pulseBadgeLabel,
                badgeKey: pulseBadgeKey,
                rangeLabel: "60-100 bpm",
              } satisfies MetricResult,
            ]
          : []),
      ],
    }
  }

  if (metricType === MetricType.BloodSugar) {
    const unit = formValues.unit || "mg/dL"
    const value = parseManualNumber(formValues.bloodSugarValue)
    const valueMgDl = unit === "mmol/L" ? Math.round(value * 18) : value
    const severity = resolveBloodGlucoseSeverity(valueMgDl, formValues.meal)
    const meta = buildResultMeta("6connect", severity)

    return {
      ...meta,
      deviceId: null,
      family: "blood_glucose",
      takenAt: createMeasurementTimestamp(takenAt),
      metrics: [
        {
          id: "blood-glucose",
          label: "Đường huyết",
          type: MetricType.BloodSugar,
          measurementSubType: MetricBloodSugarMeasurement.BloodGlucose,
          value: formatMetricValue(value, unit),
          badgeLabel: badgeLabelFromSeverity(severity),
          badgeKey: badgeFromSeverity(severity),
          rangeLabel: resolveBloodGlucoseRangeLabel(unit),
        },
      ],
    }
  }

  if (metricType === MetricType.Cholesterol) {
    const measurementSubType = resolveManualCholesterolMeasurementSubType(
      formValues.measurement
    )
    const value = parseManualNumber(formValues.cholesterolValue)
    const severity =
      resolveCholesterolSeverity(measurementSubType, {
        value,
        unit: "mg/dL",
      }) ?? "lv2"
    const meta = buildResultMeta("6connect", severity)

    return {
      ...meta,
      deviceId: null,
      family: "lipid_panel",
      takenAt: createMeasurementTimestamp(takenAt),
      metrics: [
        {
          id: "cholesterol",
          label: resolveCholesterolLabel(measurementSubType),
          type: MetricType.Cholesterol,
          measurementSubType,
          value: formatMetricValue(value, "mg/dL"),
          badgeLabel: badgeLabelFromSeverity(severity),
          badgeKey: badgeFromSeverity(severity),
        },
      ],
    }
  }

  if (metricType === MetricType.UricAcid) {
    const value = parseManualNumber(formValues.uricAcidValue)
    const severity =
      resolveUricAcidSeverity({ value, unit: "mg/dL" }) ?? "lv2"
    const meta = buildResultMeta("6connect", severity)

    return {
      ...meta,
      deviceId: null,
      family: "uric_acid",
      takenAt: createMeasurementTimestamp(takenAt),
      metrics: [
        {
          id: "uric-acid",
          label: "Acid uric",
          type: MetricType.UricAcid,
          value: formatMetricValue(value, "mg/dL"),
          badgeLabel: badgeLabelFromSeverity(severity),
          badgeKey: badgeFromSeverity(severity),
          rangeLabel: "3.5-7.2 mg/dL",
        },
      ],
    }
  }

  if (metricType === MetricType.HeartRate) {
    const heartRate = parseManualNumber(formValues.heartRateValue)
    const severity = resolveHeartRateSeverity(heartRate)
    const meta = buildResultMeta("p80", severity)

    return {
      ...meta,
      deviceId: null,
      family: "heart_rate",
      takenAt: createMeasurementTimestamp(takenAt),
      metrics: [
        {
          id: "heart-rate",
          label: "Nhịp tim",
          type: MetricType.HeartRate,
          value: `${heartRate} bpm`,
          badgeLabel: badgeLabelFromSeverity(severity),
          badgeKey: badgeFromSeverity(severity),
          rangeLabel: "60-100 bpm",
        },
      ],
    }
  }

  const simpleManualMetricConfig: Partial<
    Record<
      ManualMetricType,
      {
        family: MeasurementFamily
        field: string
        id: string
        label: string
        unit: string
      }
    >
  > = {
    [MetricType.Hematocrit]: {
      family: "hematocrit",
      field: formValues.hematocritValue,
      id: "hematocrit",
      label: "Hematocrit",
      unit: "%",
    },
    [MetricType.Hemoglobin]: {
      family: "hemoglobin",
      field: formValues.hemoglobinValue,
      id: "hemoglobin",
      label: "Hemoglobin",
      unit: "g/dL",
    },
    [MetricType.Ketone]: {
      family: "ketone",
      field: formValues.ketoneValue,
      id: "ketone",
      label: "Ketone",
      unit: formValues.unit || "mmol/L",
    },
  }

  const simpleMetricConfig = simpleManualMetricConfig[metricType]

  if (simpleMetricConfig) {
    const meta = buildResultMeta("6connect", "lv2")

    return {
      ...meta,
      deviceId: null,
      family: simpleMetricConfig.family,
      takenAt: createMeasurementTimestamp(takenAt),
      metrics: [
        {
          id: simpleMetricConfig.id,
          label: simpleMetricConfig.label,
          type: metricType,
          value: formatMetricValue(
            parseManualNumber(simpleMetricConfig.field),
            simpleMetricConfig.unit
          ),
        },
      ],
    }
  }

  throw new Error(`Unsupported manual metric type: ${metricType}`)
}

export const comingSoonDeviceError: DeviceError = {
  title: "Chức năng thiết bị đang phát triển",
  headline: "Đo chỉ số bằng thiết bị Bluetooth chưa khả dụng",
  bullets: [
    "Tính năng kết nối Bluetooth với FORA® 6 Connect và P80 đang được phát triển.",
    "Vui lòng sử dụng tab “Nhập tay” để thêm chỉ số thủ công.",
    "Hệ thống sẽ mở khoá kết nối thiết bị trong phiên bản sắp tới.",
  ],
}
