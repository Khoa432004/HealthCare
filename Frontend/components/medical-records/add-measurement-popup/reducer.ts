/**
 * Ported 1:1 from ysalus-source/.../add-measurement-popup/reducer.ts
 */

import { initialAddMeasurementState } from "./config"
import type { UIEvent, UIState } from "./types"

export const addMeasurementPopupReducer = (
  state: UIState,
  event: UIEvent
): UIState => {
  switch (event.type) {
    case "OPEN":
      return {
        ...initialAddMeasurementState,
        view: "entry_selection",
      }

    case "CLOSE":
      return initialAddMeasurementState

    case "SELECT_MODE":
      return {
        ...state,
        mode: event.mode,
        manualMetricType:
          event.mode === "manual" ? state.manualMetricType : null,
      }

    case "SELECT_MANUAL_METRIC":
      return {
        ...state,
        manualMetricType: event.metricType,
      }

    case "BACK_TO_MANUAL_SELECTION":
      return {
        ...state,
        manualMetricType: null,
      }

    case "REGISTER_DEVICES":
      return {
        ...state,
        registeredDeviceIds: event.deviceIds,
      }

    case "OPEN_SETUP":
      return {
        ...state,
        deviceId: event.deviceId,
        error: null,
        result: null,
        recommendationTab: "info",
        countdownSeconds: initialAddMeasurementState.countdownSeconds,
        view: "setup_guide",
      }

    case "BACK_TO_ENTRY":
      return {
        ...state,
        view: "entry_selection",
        deviceId: null,
        error: null,
        result: null,
        manualMetricType: null,
        countdownSeconds: initialAddMeasurementState.countdownSeconds,
        discoveredDeviceName: null,
        recommendationTab: "info",
      }

    case "START_CONNECT":
      return {
        ...state,
        view: "permission_check",
        error: null,
      }

    case "PERMISSION_GRANTED":
      return {
        ...state,
        view: "scanning",
      }

    case "SCAN_FOUND":
      return {
        ...state,
        view: "device_discovered",
        discoveredDeviceName: event.deviceName,
      }

    case "CONFIRM_CONNECT":
      return {
        ...state,
        view: "connecting",
      }

    case "CONNECT_SUCCESS":
      return {
        ...state,
        view: "measuring",
        countdownSeconds: event.countdownSeconds,
      }

    case "CONNECTION_ERROR":
      return {
        ...state,
        view: event.view,
        error: event.error,
      }

    case "COUNTDOWN_TICK":
      return {
        ...state,
        countdownSeconds: event.countdownSeconds,
      }

    case "MANUAL_MEASUREMENT_REVIEWED":
      return {
        ...state,
        view: "result_review",
        mode: "manual",
        deviceId: null,
        result: event.result,
        error: null,
        recommendationTab: "info",
        countdownSeconds: initialAddMeasurementState.countdownSeconds,
      }

    case "MEASUREMENT_RECEIVED":
      return {
        ...state,
        view: "result_review",
        result: event.result,
        error: null,
        countdownSeconds: initialAddMeasurementState.countdownSeconds,
      }

    case "RETRY":
      return {
        ...state,
        view: "setup_guide",
        error: null,
        countdownSeconds: initialAddMeasurementState.countdownSeconds,
      }

    case "SWITCH_RECOMMENDATION_TAB":
      return {
        ...state,
        recommendationTab: event.tab,
      }

    default:
      return state
  }
}
