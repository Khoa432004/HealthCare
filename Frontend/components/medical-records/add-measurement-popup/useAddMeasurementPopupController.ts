/**
 * Simplified port of ysalus-source/.../useAddMeasurementPopupController.ts
 *
 * The ysalus controller wires an internal reducer, a BLE SDK (`usePCLink`),
 * a countdown timer, realtime subscriptions, and the save/reminder mutations.
 * HealthCare doesn't carry the FORA BLE SDK, so this hook:
 *   - Handles the full manual-entry flow end-to-end (OPEN -> EntrySelection ->
 *     ManualMetric selection -> review -> ResultStage -> onSave callback).
 *   - Short-circuits the device-entry flow straight into a FailureStage whose
 *     copy announces that Bluetooth measurements are coming soon.
 *   - Replaces the save/reminder mutations with a single `onSave` callback so
 *     the parent (medical-records tab) decides how to persist the measurement.
 */

"use client"

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react"
import { toast } from "sonner"

import {
  MetricBloodSugarMeasurement,
  MetricCholesterolMeasurement,
  MetricTimeOfDay,
  MetricType,
} from "../ysalus-metrics/types"
import {
  buildMeasurementResultFromManual,
  comingSoonDeviceError,
  defaultRegisteredDeviceIds,
  deviceCatalog,
  initialAddMeasurementState,
} from "./config"
import { getDefaultUnitForManualMetric } from "./manualConfig"
import { addMeasurementPopupReducer } from "./reducer"
import { useMeasurementContextForm } from "./useMeasurementContextForm"
import { useSubjectOptions } from "./useSubjectOptions"
import type {
  DeviceDefinition,
  DeviceId,
  ManualMetricType,
  MeasurementContextFormValues,
  NormalizedMeasurement,
  RecommendationTab,
  UIState,
} from "./types"

interface UseAddMeasurementPopupControllerParams {
  isOpen: boolean
  onClose: () => void
  onSave?: (payload: {
    result: NormalizedMeasurement
    formValues: MeasurementContextFormValues
  }) => Promise<void> | void
  patientId?: string
  patientName?: string
  readableId?: string
}

export const useAddMeasurementPopupController = ({
  isOpen,
  onClose,
  onSave,
  patientId,
  patientName,
  readableId,
}: UseAddMeasurementPopupControllerParams) => {
  const [state, dispatch] = useReducer(
    addMeasurementPopupReducer,
    initialAddMeasurementState,
  )
  const wasOpenRef = useRef(false)
  const isClosingRef = useRef(false)
  const isSavingRef = useRef(false)

  const subjects = useSubjectOptions({ patientId, patientName, readableId })

  const currentDevice = useMemo<DeviceDefinition | null>(
    () => (state.deviceId ? deviceCatalog[state.deviceId] : null),
    [state.deviceId],
  )
  const supportsMealContext =
    currentDevice?.capabilities.includes("meal_context") ?? false
  const form = useMeasurementContextForm({ supportsMealContext })
  const selectedProfileId = form.watch("profileId")

  const activePatientId = useMemo(() => {
    if (
      selectedProfileId &&
      subjects.some((subject) => subject.id === selectedProfileId)
    ) {
      return selectedProfileId
    }

    return subjects[0]?.id ?? null
  }, [selectedProfileId, subjects])

  useEffect(() => {
    if (activePatientId && selectedProfileId !== activePatientId) {
      form.setValue("profileId", activePatientId, {
        shouldDirty: false,
        shouldValidate: false,
      })
      return
    }

    if (!activePatientId && selectedProfileId) {
      form.setValue("profileId", "", {
        shouldDirty: false,
        shouldValidate: false,
      })
    }
  }, [activePatientId, form, selectedProfileId])

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === activePatientId) ?? null,
    [activePatientId, subjects],
  )

  const resetManualFields = useCallback(() => {
    form.setValue("manualMetricType", null, {
      shouldDirty: false,
      shouldValidate: false,
    })
    const blankFields: Array<keyof MeasurementContextFormValues> = [
      "systolicValue",
      "diastolicValue",
      "pulseValue",
      "bloodSugarValue",
      "cholesterolValue",
      "heartRateValue",
      "hematocritValue",
      "hemoglobinValue",
      "ketoneValue",
      "uricAcidValue",
      "notes",
    ]
    blankFields.forEach((field) => {
      form.setValue(field, "", { shouldDirty: false, shouldValidate: false })
    })
    form.setValue("unit", "mg/dL", {
      shouldDirty: false,
      shouldValidate: false,
    })
    form.setValue(
      "measurement",
      MetricCholesterolMeasurement.TotalCholesterol,
      { shouldDirty: false, shouldValidate: false },
    )
    form.setValue("meal", null, {
      shouldDirty: false,
      shouldValidate: false,
    })
  }, [form])

  const resetInternalState = useCallback(() => {
    dispatch({ type: "CLOSE" })
    form.reset()
  }, [form])

  useEffect(() => {
    if (isOpen) {
      if (!wasOpenRef.current) {
        dispatch({ type: "OPEN" })
      }
      wasOpenRef.current = true
      return
    }

    if (wasOpenRef.current && !isClosingRef.current) {
      resetInternalState()
    }

    wasOpenRef.current = false
    isClosingRef.current = false
  }, [isOpen, resetInternalState])

  const handleClose = useCallback(() => {
    isClosingRef.current = true
    resetInternalState()
    onClose()
  }, [onClose, resetInternalState])

  const handleModeChange = useCallback(
    (mode: UIState["mode"]) => {
      if (state.mode === mode) {
        return
      }

      form.setValue("entryMode", mode, {
        shouldDirty: false,
        shouldValidate: false,
      })
      form.clearErrors()

      if (mode === "device" || state.mode === "device") {
        resetManualFields()
      }

      dispatch({ type: "SELECT_MODE", mode })
    },
    [form, resetManualFields, state.mode],
  )

  const handleSelectManualMetric = useCallback(
    (metricType: ManualMetricType) => {
      form.clearErrors("root")
      const blankFields: Array<keyof MeasurementContextFormValues> = [
        "systolicValue",
        "diastolicValue",
        "pulseValue",
        "bloodSugarValue",
        "cholesterolValue",
        "heartRateValue",
        "hematocritValue",
        "hemoglobinValue",
        "ketoneValue",
        "uricAcidValue",
      ]
      blankFields.forEach((field) => {
        form.setValue(field, "", { shouldDirty: false, shouldValidate: false })
      })
      form.setValue("manualMetricType", metricType, {
        shouldDirty: false,
        shouldValidate: false,
      })
      form.setValue(
        "meal",
        metricType === MetricType.BloodSugar
          ? form.getValues("meal") ?? MetricTimeOfDay.AfterMeal
          : null,
        { shouldDirty: false, shouldValidate: false },
      )
      form.setValue("unit", getDefaultUnitForManualMetric(metricType), {
        shouldDirty: false,
        shouldValidate: false,
      })
      form.setValue(
        "measurement",
        metricType === MetricType.BloodSugar
          ? MetricBloodSugarMeasurement.BloodGlucose
          : metricType === MetricType.Cholesterol
            ? MetricCholesterolMeasurement.TotalCholesterol
            : "",
        { shouldDirty: false, shouldValidate: false },
      )
      dispatch({ type: "SELECT_MANUAL_METRIC", metricType })
    },
    [form],
  )

  const handleAddDevices = useCallback(() => {
    dispatch({
      type: "REGISTER_DEVICES",
      deviceIds: defaultRegisteredDeviceIds,
    })
  }, [])

  const handleOpenSetup = useCallback((deviceId: DeviceId) => {
    dispatch({ type: "OPEN_SETUP", deviceId })
  }, [])

  const handleBackToEntry = useCallback(() => {
    dispatch({ type: "BACK_TO_ENTRY" })
  }, [])

  /**
   * Device flow is stubbed: immediately short-circuit into a FailureStage that
   * communicates the "coming soon" status of the BLE integration.
   */
  const handleStartConnect = useCallback(() => {
    dispatch({
      type: "CONNECTION_ERROR",
      view: "connect_failed",
      error: comingSoonDeviceError,
    })
  }, [])

  const handleRetryMeasurement = useCallback(() => {
    dispatch({ type: "RETRY" })
  }, [])

  const handleSwitchRecommendationTab = useCallback((tab: RecommendationTab) => {
    dispatch({ type: "SWITCH_RECOMMENDATION_TAB", tab })
  }, [])

  const handleReviewManualResult = useCallback(async () => {
    const isValid = await form.trigger()
    if (!isValid || !activePatientId || !state.manualMetricType) {
      return
    }

    try {
      const result = buildMeasurementResultFromManual(form.getValues())
      dispatch({ type: "MANUAL_MEASUREMENT_REVIEWED", result })
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Không thể tạo số đo. Vui lòng thử lại.",
      })
    }
  }, [activePatientId, form, state.manualMetricType])

  const handleSaveResult = useCallback(async () => {
    if (!state.result || !activePatientId) {
      return
    }

    const isValid = await form.trigger()
    if (!isValid) {
      return
    }

    isSavingRef.current = true
    try {
      await onSave?.({
        result: state.result,
        formValues: form.getValues(),
      })
      toast.success("Đã lưu số đo")
      handleClose()
    } catch (error) {
      console.error("[AddMeasurementPopup] save failed", error)
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu số đo",
      )
    } finally {
      isSavingRef.current = false
    }
  }, [activePatientId, form, handleClose, onSave, state.result])

  const handleSetReminder = useCallback(() => {
    toast.info("Tính năng nhắc nhở sẽ sớm được cập nhật.")
  }, [])

  const handleBookAppointment = useCallback(() => {
    toast.info("Tính năng đặt lịch hẹn đang được hoàn thiện.")
    handleClose()
  }, [handleClose])

  const modalClassName = useMemo(() => {
    if (state.view === "result_review") {
      return "!w-full !max-w-[680px] !rounded-[30px] !overflow-hidden"
    }

    if (
      state.view === "setup_guide" ||
      state.view === "permission_check" ||
      state.view === "scanning" ||
      state.view === "device_discovered" ||
      state.view === "connecting" ||
      state.view === "measuring" ||
      state.view === "permission_blocked" ||
      state.view === "connect_failed" ||
      state.view === "measurement_failed"
    ) {
      return "!w-full !max-w-[1120px] !rounded-[30px] !overflow-hidden"
    }

    return "!w-full !max-w-[1024px] !rounded-[30px] !overflow-hidden"
  }, [state.view])

  const registeredDevices = useMemo(
    () =>
      state.registeredDeviceIds
        .map((deviceId) => deviceCatalog[deviceId])
        .filter((device): device is DeviceDefinition => Boolean(device)),
    [state.registeredDeviceIds],
  )

  return {
    countdownDisplayIsLoading: false,
    countdownDisplayUnitLabel: "s" as const,
    countdownDisplayValue: state.countdownSeconds,
    countdownProgressSeconds: state.countdownSeconds,
    countdownTotalSeconds: initialAddMeasurementState.countdownSeconds,
    currentDevice,
    form,
    modalClassName,
    measurementStatusCopy: null,
    measurementLoopLabel: null,
    isSavePending: false,
    isReminderPending: false,
    state,
    subjects,
    subjectOptions: subjects,
    supportsMealContext,
    selectedSubject,
    registeredDevices,
    handleAddDevices,
    handleBackToEntry,
    handleBookAppointment,
    handleClose,
    handleModeChange,
    handleOpenSetup,
    handleRetryMeasurement,
    handleReviewManualResult,
    handleSaveResult,
    handleSelectManualMetric,
    handleSetReminder,
    handleStartConnect,
    handleSwitchRecommendationTab,
  }
}
