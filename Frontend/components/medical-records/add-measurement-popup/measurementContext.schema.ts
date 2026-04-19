/**
 * Ported from ysalus-source/.../measurementContext.schema.ts
 * Rewritten using zod (HealthCare uses zod, ysalus uses yup).
 * Validation semantics kept identical.
 */

import { z } from "zod"

import {
  MetricBloodSugarMeasurement,
  MetricCholesterolMeasurement,
  MetricTimeOfDay,
  MetricType,
} from "../ysalus-metrics/types"

const parseNumericInput = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value !== "string") return null

  const normalized = value.trim()
  if (!normalized) return null

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

const METRIC_VALUE_RANGES: Partial<
  Record<MetricType, { min: number; max: number; label: string }>
> = {
  [MetricType.BloodSugar]: {
    min: 0.1,
    max: 1000,
    label: "Đường huyết",
  },
  [MetricType.Cholesterol]: {
    min: 1,
    max: 1000,
    label: "Cholesterol",
  },
  [MetricType.UricAcid]: {
    min: 0.1,
    max: 30,
    label: "Acid uric",
  },
  [MetricType.HeartRate]: {
    min: 20,
    max: 260,
    label: "Nhịp tim",
  },
  [MetricType.Hematocrit]: {
    min: 1,
    max: 80,
    label: "Hematocrit",
  },
  [MetricType.Hemoglobin]: {
    min: 1,
    max: 30,
    label: "Hemoglobin",
  },
  [MetricType.Ketone]: {
    min: 0.1,
    max: 300,
    label: "Ketone",
  },
}

const measurementContextSchemaShape = z.object({
  entryMode: z.enum(["manual", "device"]),
  profileId: z.string(),
  averageMode: z.boolean(),
  manualMetricType: z
    .nativeEnum(MetricType)
    .nullable()
    .refine((value) =>
      value === null ||
      [
        MetricType.BloodPressure,
        MetricType.BloodSugar,
        MetricType.Cholesterol,
        MetricType.HeartRate,
        MetricType.Hematocrit,
        MetricType.Hemoglobin,
        MetricType.Ketone,
        MetricType.UricAcid,
      ].includes(value)
    ),
  takenAtDate: z.string(),
  takenAtTime: z.string(),
  systolicValue: z.string(),
  diastolicValue: z.string(),
  pulseValue: z.string(),
  bloodSugarValue: z.string(),
  cholesterolValue: z.string(),
  heartRateValue: z.string(),
  hematocritValue: z.string(),
  hemoglobinValue: z.string(),
  ketoneValue: z.string(),
  uricAcidValue: z.string(),
  unit: z.string(),
  measurement: z
    .string()
    .or(z.literal(""))
    .refine((value) =>
      value === "" ||
      Object.values(MetricBloodSugarMeasurement).includes(
        value as MetricBloodSugarMeasurement
      ) ||
      Object.values(MetricCholesterolMeasurement).includes(
        value as MetricCholesterolMeasurement
      )
    ),
  meal: z.nativeEnum(MetricTimeOfDay).nullable(),
  notes: z.string().max(500, "Ghi chú tối đa 500 ký tự."),
})

const validateNumericField = (
  ctx: z.RefinementCtx,
  path: (string | number)[],
  value: string,
  label: string,
  min?: number,
  max?: number,
  { optional = false }: { optional?: boolean } = {}
) => {
  const trimmed = value?.trim() ?? ""

  if (!trimmed) {
    if (optional) return
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path,
      message: `${label} là bắt buộc.`,
    })
    return
  }

  const parsed = parseNumericInput(trimmed)

  if (parsed === null || !Number.isFinite(parsed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path,
      message: `${label} không hợp lệ.`,
    })
    return
  }

  if (min !== undefined && parsed < min) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path,
      message: `${label} phải từ ${min} trở lên.`,
    })
  }

  if (max !== undefined && parsed > max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path,
      message: `${label} không vượt quá ${max}.`,
    })
  }
}

export const measurementContextSchema = measurementContextSchemaShape.superRefine(
  (data, ctx) => {
    if (data.entryMode !== "manual") return

    if (!data.profileId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["profileId"],
        message: "Vui lòng chọn bệnh nhân.",
      })
    }

    if (!data.takenAtDate?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["takenAtDate"],
        message: "Vui lòng chọn ngày.",
      })
    }

    if (!data.takenAtTime?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["takenAtTime"],
        message: "Vui lòng chọn giờ.",
      })
    }

    if (!data.manualMetricType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["manualMetricType"],
        message: "Vui lòng chọn loại chỉ số.",
      })
      return
    }

    const metricType = data.manualMetricType

    if (metricType === MetricType.BloodPressure) {
      validateNumericField(
        ctx,
        ["systolicValue"],
        data.systolicValue,
        "Huyết áp tâm thu",
        40,
        300
      )
      validateNumericField(
        ctx,
        ["diastolicValue"],
        data.diastolicValue,
        "Huyết áp tâm trương",
        30,
        200
      )

      const systolic = parseNumericInput(data.systolicValue)
      const diastolic = parseNumericInput(data.diastolicValue)

      if (
        systolic !== null &&
        diastolic !== null &&
        Number.isFinite(systolic) &&
        Number.isFinite(diastolic) &&
        systolic <= diastolic
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["diastolicValue"],
          message: "Huyết áp tâm thu phải lớn hơn huyết áp tâm trương.",
        })
      }

      if (data.pulseValue?.trim()) {
        validateNumericField(
          ctx,
          ["pulseValue"],
          data.pulseValue,
          "Nhịp tim",
          20,
          250,
          { optional: true }
        )
      }

      return
    }

    const valueFieldMap: Partial<
      Record<MetricType, keyof typeof data>
    > = {
      [MetricType.BloodSugar]: "bloodSugarValue",
      [MetricType.Cholesterol]: "cholesterolValue",
      [MetricType.HeartRate]: "heartRateValue",
      [MetricType.Hematocrit]: "hematocritValue",
      [MetricType.Hemoglobin]: "hemoglobinValue",
      [MetricType.Ketone]: "ketoneValue",
      [MetricType.UricAcid]: "uricAcidValue",
    }

    const fieldName = valueFieldMap[metricType]
    if (!fieldName) return

    const rawValue = data[fieldName] as string
    const range = METRIC_VALUE_RANGES[metricType]
    if (range) {
      validateNumericField(
        ctx,
        [fieldName as string],
        rawValue,
        range.label,
        range.min,
        range.max
      )
    }

    if (
      metricType === MetricType.BloodSugar ||
      metricType === MetricType.Ketone
    ) {
      if (!data.unit?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["unit"],
          message: "Vui lòng chọn đơn vị.",
        })
      }
    }

    if (metricType === MetricType.Cholesterol) {
      if (
        !Object.values(MetricCholesterolMeasurement).includes(
          data.measurement as MetricCholesterolMeasurement
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["measurement"],
          message: "Vui lòng chọn loại cholesterol.",
        })
      }
    }

    if (metricType === MetricType.BloodSugar) {
      if (data.measurement !== MetricBloodSugarMeasurement.BloodGlucose) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["measurement"],
          message: "Vui lòng chọn loại đường huyết.",
        })
      }

      if (!data.meal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["meal"],
          message: "Vui lòng chọn thời điểm đo.",
        })
      }
    }
  }
)

export type MeasurementContextSchema = typeof measurementContextSchema
