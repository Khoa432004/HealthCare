/**
 * Ported from ysalus-source/.../add-measurement-popup/AddMeasurementPopup.tsx
 *
 * ysalus-web uses its own <Dialog> wrapper and wires everything through a
 * controller hook. HealthCare uses @radix-ui/react-dialog via components/ui/dialog.
 * We reuse the ported controller + the ported stage views, and lean on
 * Radix Dialog for the modal shell.
 */

"use client"

import { FormProvider } from "react-hook-form"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

import { AddMeasurementPopupView } from "./AddMeasurementPopupView"
import { useAddMeasurementPopupController } from "./useAddMeasurementPopupController"
import type { MeasurementContextFormValues, NormalizedMeasurement } from "./types"

interface AddMeasurementPopupProps {
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

export const AddMeasurementPopup = ({
  isOpen,
  onClose,
  onSave,
  patientId,
  patientName,
  readableId,
}: AddMeasurementPopupProps) => {
  const controller = useAddMeasurementPopupController({
    isOpen,
    onClose,
    onSave,
    patientId,
    patientName,
    readableId,
  })

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          controller.handleClose()
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={`!p-0 !gap-0 !border-0 !bg-white !shadow-xl max-h-[95dvh] overflow-y-auto ${controller.modalClassName}`}
      >
        <DialogTitle className="sr-only">Thêm số đo</DialogTitle>
        <DialogDescription className="sr-only">
          Thêm chỉ số sức khoẻ bằng cách nhập tay hoặc kết nối thiết bị.
        </DialogDescription>
        <FormProvider {...controller.form}>
          <AddMeasurementPopupView
            countdownDisplayIsLoading={controller.countdownDisplayIsLoading}
            countdownDisplayUnitLabel={controller.countdownDisplayUnitLabel}
            countdownDisplayValue={controller.countdownDisplayValue}
            countdownProgressSeconds={controller.countdownProgressSeconds}
            countdownTotalSeconds={controller.countdownTotalSeconds}
            currentDevice={controller.currentDevice}
            isReminderPending={controller.isReminderPending}
            isSavePending={controller.isSavePending}
            measurementLoopLabel={controller.measurementLoopLabel}
            measurementStatusCopy={controller.measurementStatusCopy}
            onAddDevices={controller.handleAddDevices}
            onBackToEntry={controller.handleBackToEntry}
            onBookAppointment={controller.handleBookAppointment}
            onClose={controller.handleClose}
            onModeChange={controller.handleModeChange}
            onOpenSetup={controller.handleOpenSetup}
            onRetryMeasurement={controller.handleRetryMeasurement}
            onReviewManual={controller.handleReviewManualResult}
            onSaveResult={controller.handleSaveResult}
            onSelectManualMetric={controller.handleSelectManualMetric}
            onSetReminder={controller.handleSetReminder}
            onStartConnect={controller.handleStartConnect}
            onSwitchRecommendationTab={controller.handleSwitchRecommendationTab}
            registeredDevices={controller.registeredDevices}
            selectedSubject={controller.selectedSubject}
            showMealField={controller.supportsMealContext}
            state={controller.state}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
