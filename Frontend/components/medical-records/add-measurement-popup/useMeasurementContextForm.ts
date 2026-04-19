/**
 * Ported from ysalus-source/.../useMeasurementContextForm.ts
 * Switched resolver from yupResolver to zodResolver.
 */

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { MetricTimeOfDay } from "../ysalus-metrics/types"
import { defaultMeasurementContextValues } from "./config"
import { measurementContextSchema } from "./measurementContext.schema"
import type { MeasurementContextFormValues } from "./types"

interface UseMeasurementContextFormParams {
  supportsMealContext: boolean
}

export const useMeasurementContextForm = ({
  supportsMealContext,
}: UseMeasurementContextFormParams) => {
  const form = useForm<MeasurementContextFormValues>({
    defaultValues: defaultMeasurementContextValues,
    resolver: zodResolver(measurementContextSchema) as never,
    mode: "onSubmit",
  })

  useEffect(() => {
    if (!supportsMealContext) {
      form.setValue("meal", null, {
        shouldDirty: false,
        shouldValidate: false,
      })
    } else if (form.getValues("meal") === null) {
      form.setValue("meal", MetricTimeOfDay.AfterMeal, {
        shouldDirty: false,
        shouldValidate: false,
      })
    }
  }, [form, supportsMealContext])

  return form
}
