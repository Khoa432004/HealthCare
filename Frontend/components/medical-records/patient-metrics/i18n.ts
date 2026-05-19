/**
 * Lightweight i18n shim for the patient-metrics feature.
 *
 * In ysalus-web the patient-metrics components depend on react-i18next via
 * `useTranslation()` and pass the resulting `t` down to chart helpers. To
 * preserve the exact same call sites without bringing a full i18n dependency
 * into HealthCare, we expose a synchronous Vietnamese dictionary with a
 * compatible `t(key, options?)` shape. Keys are kept identical to the original
 * `i18n` keys so the rest of the ported code reads 1:1 against ysalus.
 */

type Options = { count?: number } | undefined

type DictionaryValue = string | ((options: Options) => string)

const DICTIONARY: Record<string, DictionaryValue> = {
  // Tabs / categories
  all: "Tất cả",
  bloodPressure: "Huyết áp",
  bloodGlucose: "Đường huyết",
  heartRate: "Nhịp tim",
  cholesterol: "Cholesterol",
  ecg: "ECG",
  hematocrit: "Hematocrit",
  hemoglobin: "Hemoglobin",
  ketone: "Ketone",
  uricAcid: "Acid uric",

  // Period / granularity
  week: "Tuần",
  month: "Tháng",
  year: "Năm",
  today: "Hôm nay",

  // Severity (kept lower-case to match ysalus `t(severity)` calls)
  low: "Thấp",
  normal: "Bình thường",
  upper: "Hơi cao",
  high: "Cao",

  // Misc UI
  latestMeasurements: "Đo lường gần nhất",
  noDataAvailable: "Không có dữ liệu",
  systolic: "Tâm thu",
  diastolic: "Tâm trương",

  // Blood glucose meal context (dot shape encoding)
  bgBeforeMeal: "Trước ăn",
  bgAfterMeal: "Sau ăn",
  bgGeneral: "Bình thường",

  // Tooltip detail line: "Trung bình {count} lần đo"
  metricsChartAvgSample: (options) => {
    const count = options?.count ?? 1
    return `Trung bình ${count} lần đo`
  },
}

export type TFunction = (key: string, options?: Options) => string

/** Single shared translator used across the patient-metrics feature. */
export const t: TFunction = (key, options) => {
  const value = DICTIONARY[key]
  if (typeof value === "function") return value(options)
  return value ?? key
}

/** React hook-style alias to ease porting `const { t } = useTranslation();`. */
export function useTranslation(): { t: TFunction } {
  return { t }
}
