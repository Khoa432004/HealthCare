/**
 * Ported 1:1 from ysalus-source/.../AddMeasurementPopupView.tsx
 */

"use client"

import { useMemo } from "react"
import { MetricType } from "../ysalus-metrics/types"
import { EntrySelectionStage } from "./EntrySelectionStage"
import { FailureStage } from "./FailureStage"
import { MeasuringStage } from "./MeasuringStage"
import { ResultStage } from "./ResultStage"
import { SetupGuideStage } from "./SetupGuideStage"
import type {
  DeviceDefinition,
  ManualMetricType,
  RecommendationTab,
  SubjectOption,
  UIState,
} from "./types"

interface Props {
  currentDevice: DeviceDefinition | null
  countdownDisplayIsLoading: boolean
  countdownDisplayUnitLabel: string | null
  countdownDisplayValue: number | string
  countdownProgressSeconds?: number | null
  countdownTotalSeconds?: number | null
  isReminderPending: boolean
  isSavePending: boolean
  measurementLoopLabel: string | null
  measurementStatusCopy: string | null
  onAddDevices: () => void
  onBackToEntry: () => void
  onBookAppointment: () => void
  onClose: () => void
  onModeChange: (mode: UIState["mode"]) => void
  onOpenSetup: (deviceId: DeviceDefinition["id"]) => void
  onRetryMeasurement: () => void
  onReviewManual: () => void
  onSaveResult: () => void
  onSelectManualMetric: (metricType: ManualMetricType) => void
  onSetReminder: () => void
  onStartConnect: () => void
  onSwitchRecommendationTab: (tab: RecommendationTab) => void
  registeredDevices: DeviceDefinition[]
  selectedSubject: SubjectOption | null
  showMealField: boolean
  state: UIState
}

export const AddMeasurementPopupView = ({
  currentDevice,
  countdownDisplayIsLoading,
  countdownDisplayUnitLabel,
  countdownDisplayValue,
  countdownProgressSeconds,
  countdownTotalSeconds,
  isReminderPending,
  isSavePending,
  measurementLoopLabel,
  measurementStatusCopy,
  onAddDevices,
  onBackToEntry,
  onBookAppointment,
  onClose,
  onModeChange,
  onOpenSetup,
  onRetryMeasurement,
  onReviewManual,
  onSaveResult,
  onSelectManualMetric,
  onSetReminder,
  onStartConnect,
  onSwitchRecommendationTab,
  registeredDevices,
  selectedSubject,
  showMealField,
  state,
}: Props) => {
  const measuringView = useMemo(() => {
    if (
      state.view === "permission_check" ||
      state.view === "scanning" ||
      state.view === "device_discovered" ||
      state.view === "connecting" ||
      state.view === "measuring"
    ) {
      return state.view
    }

    return null
  }, [state.view])

  const shouldShowMealField = useMemo(() => {
    if (!state.result) {
      return showMealField
    }

    return state.result.metrics.some(
      (metric) => metric.type === MetricType.BloodSugar,
    )
  }, [showMealField, state.result])

  if (state.view === "setup_guide" && currentDevice) {
    return (
      <SetupGuideStage
        device={currentDevice}
        onBack={onBackToEntry}
        onClose={onClose}
        onStartConnect={onStartConnect}
      />
    )
  }

  if (measuringView) {
    return (
      <MeasuringStage
        isLoading={countdownDisplayIsLoading}
        displayUnitLabel={countdownDisplayUnitLabel}
        displayValue={countdownDisplayValue}
        progressSeconds={countdownProgressSeconds}
        progressTotalSeconds={countdownTotalSeconds}
        measurementLoopLabel={measurementLoopLabel}
        measurementStatusCopy={measurementStatusCopy}
        onClose={onClose}
        view={measuringView}
      />
    )
  }

  if (
    (state.view === "permission_blocked" ||
      state.view === "connect_failed" ||
      state.view === "measurement_failed") &&
    state.error
  ) {
    return (
      <FailureStage
        error={state.error}
        onBack={onBackToEntry}
        onClose={onClose}
        onRetry={onRetryMeasurement}
      />
    )
  }

  if (state.view === "result_review" && state.result) {
    return (
      <ResultStage
        activeTab={state.recommendationTab}
        isReminderPending={isReminderPending}
        isSavePending={isSavePending}
        onBookAppointment={onBookAppointment}
        onClose={onClose}
        onSave={onSaveResult}
        onSetReminder={onSetReminder}
        onSwitchTab={onSwitchRecommendationTab}
        result={state.result}
        showMealField={shouldShowMealField}
        subject={selectedSubject}
      />
    )
  }

  return (
    <EntrySelectionStage
      devices={registeredDevices}
      isSavePending={state.mode === "manual" ? false : isSavePending}
      mode={state.mode}
      onAddDevices={onAddDevices}
      onClose={onClose}
      onModeChange={onModeChange}
      onReviewManual={onReviewManual}
      onSelectManualMetric={onSelectManualMetric}
      onTakeExamination={onOpenSetup}
      selectedManualMetric={state.manualMetricType}
    />
  )
}
