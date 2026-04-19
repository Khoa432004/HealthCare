import {
  MetricCholesterolMeasurement,
  MetricType,
  type MetricDetail,
} from "./types"

export const CLIENT_METRIC_FILTER_KEY_ORDER = [
  "bp",
  "hr",
  "bg",
  "ket",
  "tc",
  "hdl",
  "ldl",
  "triglyceride",
  "ua",
  "hb",
  "hct",
] as const

export type ClientMetricFilterKey =
  (typeof CLIENT_METRIC_FILTER_KEY_ORDER)[number]

export const CLIENT_FILTER_KEY_TO_METRIC_TYPE_MAP: Record<
  ClientMetricFilterKey,
  readonly MetricType[]
> = {
  bp: [MetricType.BloodPressure],
  hr: [MetricType.BloodPressure, MetricType.HeartRate],
  bg: [MetricType.BloodSugar],
  ket: [MetricType.Ketone],
  tc: [MetricType.Cholesterol],
  hdl: [MetricType.Cholesterol],
  ldl: [MetricType.Cholesterol],
  triglyceride: [MetricType.Cholesterol],
  ua: [MetricType.UricAcid],
  hb: [MetricType.Hemoglobin],
  hct: [MetricType.Hematocrit],
} as const

export const CLIENT_FILTER_KEY_TO_MEASUREMENT_MAP: Partial<
  Record<ClientMetricFilterKey, MetricCholesterolMeasurement>
> = {
  tc: MetricCholesterolMeasurement.TotalCholesterol,
  hdl: MetricCholesterolMeasurement.HighDensityLipoprotein,
  ldl: MetricCholesterolMeasurement.LowDensityLipoprotein,
  triglyceride: MetricCholesterolMeasurement.Triglycerides,
} as const

export const CLIENT_METRIC_FILTER_KEY_COLOR_MAP: Record<
  ClientMetricFilterKey,
  string
> = {
  bp: "#16A1BD",
  hr: "#E63946",
  bg: "#E76F51",
  ket: "#9C6644",
  tc: "#577590",
  hdl: "#43AA8B",
  ldl: "#577590",
  triglyceride: "#F3722C",
  ua: "#F4A261",
  hb: "#BC4749",
  hct: "#8D99AE",
} as const

export const CLIENT_METRIC_FILTER_KEY_LABEL_MAP: Record<
  ClientMetricFilterKey,
  string
> = {
  bp: "Huyết áp",
  hr: "Nhịp tim",
  bg: "Đường huyết",
  ket: "Ceton",
  tc: "Cholesterol toàn phần",
  hdl: "HDL Cholesterol",
  ldl: "LDL Cholesterol",
  triglyceride: "Triglyceride",
  ua: "Axit uric",
  hb: "Hemoglobin",
  hct: "Hematocrit",
} as const

/** Vietnamese group labels (replaces ysalus i18n keys 1:1). */
export const HEALTH_METRIC_FILTER_GROUPS = [
  {
    label: "Huyết áp & Chức năng tim",
    clientFilterKeys: ["bp", "hr"],
  },
  {
    label: "Đường huyết & Chuyển hoá",
    clientFilterKeys: ["bg", "ket"],
  },
  {
    label: "Mỡ máu",
    clientFilterKeys: ["tc", "hdl", "ldl", "triglyceride"],
  },
  {
    label: "Chức năng thận",
    clientFilterKeys: ["ua"],
  },
  {
    label: "Huyết học",
    clientFilterKeys: ["hb", "hct"],
  },
] as const satisfies ReadonlyArray<{
  label: string
  clientFilterKeys: readonly ClientMetricFilterKey[]
}>

export function isClientMetricFilterKey(
  value: string
): value is ClientMetricFilterKey {
  return Object.prototype.hasOwnProperty.call(
    CLIENT_FILTER_KEY_TO_METRIC_TYPE_MAP,
    value
  )
}

export function getClientMetricFilterLabel(
  clientFilterKey: ClientMetricFilterKey
): string {
  return CLIENT_METRIC_FILTER_KEY_LABEL_MAP[clientFilterKey]
}

export function matchesClientMetricFilterKey(
  detail: MetricDetail,
  clientFilterKey: ClientMetricFilterKey
): boolean {
  const expectedMetricTypes =
    CLIENT_FILTER_KEY_TO_METRIC_TYPE_MAP[clientFilterKey]

  if (!expectedMetricTypes.includes(detail.type)) {
    return false
  }

  if (clientFilterKey === "hr") {
    return (
      detail.type !== MetricType.BloodPressure ||
      (detail.pulseValue !== undefined && detail.pulseValue !== null)
    )
  }

  if (clientFilterKey === "bg") {
    return detail.value !== undefined && detail.value !== null
  }

  const expectedMeasurement =
    CLIENT_FILTER_KEY_TO_MEASUREMENT_MAP[clientFilterKey]
  if (!expectedMeasurement) {
    return true
  }

  return detail.measurement === expectedMeasurement
}
