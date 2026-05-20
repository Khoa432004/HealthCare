"use client"

import { useEffect, useState } from "react"
import { Edit, Loader2, Plus, X, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/loading-spinner"
import { userService, type UpdateWorkScheduleRequest } from "@/services/user.service"
import { useToast } from "@/hooks/use-toast"

type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

type WorkPlansData = {
  sessionDuration: number
  appointmentCost: number
  days: Record<
    DayKey,
    {
      enabled: boolean
      timeSlots: { startTime: string; endTime: string }[]
    }
  >
}

const INITIAL_WORK_PLANS_DATA: WorkPlansData = {
  sessionDuration: 15,
  appointmentCost: 150000,
  days: {
    monday: { enabled: false, timeSlots: [] },
    tuesday: { enabled: false, timeSlots: [] },
    wednesday: { enabled: false, timeSlots: [] },
    thursday: { enabled: false, timeSlots: [] },
    friday: { enabled: false, timeSlots: [] },
    saturday: { enabled: false, timeSlots: [] },
    sunday: { enabled: false, timeSlots: [] },
  },
}

const DAY_LABELS: Record<DayKey, string> = {
  monday: "Thứ 2",
  tuesday: "Thứ 3",
  wednesday: "Thứ 4",
  thursday: "Thứ 5",
  friday: "Thứ 6",
  saturday: "Thứ 7",
  sunday: "Chủ nhật",
}

function scheduleToWorkPlansData(schedule: Awaited<ReturnType<typeof userService.getWorkSchedule>>): WorkPlansData {
  const dayMap: Record<number, DayKey> = {
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
    7: "sunday",
  }

  const days: Partial<WorkPlansData["days"]> = {}
  schedule.days.forEach((day) => {
    const dayKey = dayMap[day.weekday]
    if (dayKey) {
      days[dayKey] = {
        enabled: day.enabled,
        timeSlots: day.timeSlots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      }
    }
  })

  return {
    sessionDuration: schedule.sessionDuration,
    appointmentCost: Number(schedule.appointmentCost),
    days: {
      monday: days.monday || { enabled: false, timeSlots: [] },
      tuesday: days.tuesday || { enabled: false, timeSlots: [] },
      wednesday: days.wednesday || { enabled: false, timeSlots: [] },
      thursday: days.thursday || { enabled: false, timeSlots: [] },
      friday: days.friday || { enabled: false, timeSlots: [] },
      saturday: days.saturday || { enabled: false, timeSlots: [] },
      sunday: days.sunday || { enabled: false, timeSlots: [] },
    },
  }
}

export function WorkPlanSettingsPanel() {
  const { toast } = useToast()
  const [workPlansData, setWorkPlansData] = useState<WorkPlansData>(INITIAL_WORK_PLANS_DATA)
  const [workPlansErrors, setWorkPlansErrors] = useState<Record<string, string>>({})
  const [isSavingWorkPlans, setIsSavingWorkPlans] = useState(false)
  const [isLoadingWorkSchedule, setIsLoadingWorkSchedule] = useState(false)
  const [originalWorkPlansData, setOriginalWorkPlansData] = useState<WorkPlansData>(INITIAL_WORK_PLANS_DATA)

  const loadWorkSchedule = async () => {
    setIsLoadingWorkSchedule(true)
    try {
      const schedule = await userService.getWorkSchedule()
      const data = scheduleToWorkPlansData(schedule)
      setWorkPlansData(data)
      setOriginalWorkPlansData(data)
    } catch (error: unknown) {
      console.error("Error loading work schedule:", error)
      const message = error instanceof Error ? error.message : "Không thể tải lịch làm việc"
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoadingWorkSchedule(false)
    }
  }

  useEffect(() => {
    loadWorkSchedule()
  }, [])

  const toggleDayEnabled = (dayKey: DayKey) => {
    setWorkPlansData((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [dayKey]: {
          ...prev.days[dayKey],
          enabled: !prev.days[dayKey].enabled,
          timeSlots: !prev.days[dayKey].enabled ? prev.days[dayKey].timeSlots : prev.days[dayKey].timeSlots,
        },
      },
    }))
  }

  const addTimeSlot = (dayKey: DayKey) => {
    setWorkPlansData((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [dayKey]: {
          ...prev.days[dayKey],
          timeSlots: [...prev.days[dayKey].timeSlots, { startTime: "08:00", endTime: "12:00" }],
        },
      },
    }))
  }

  const removeTimeSlot = (dayKey: DayKey, slotIndex: number) => {
    setWorkPlansData((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [dayKey]: {
          ...prev.days[dayKey],
          timeSlots: prev.days[dayKey].timeSlots.filter((_, index) => index !== slotIndex),
        },
      },
    }))
  }

  const updateTimeSlot = (
    dayKey: DayKey,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setWorkPlansData((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [dayKey]: {
          ...prev.days[dayKey],
          timeSlots: prev.days[dayKey].timeSlots.map((slot, index) =>
            index === slotIndex ? { ...slot, [field]: value } : slot
          ),
        },
      },
    }))
  }

  const validateWorkPlans = (): boolean => {
    const errors: Record<string, string> = {}

    if (!workPlansData.appointmentCost || workPlansData.appointmentCost <= 0) {
      errors.appointmentCost = "Giá khám phải lớn hơn 0"
    }

    const validDurations = [10, 15, 20, 30, 60]
    if (!validDurations.includes(workPlansData.sessionDuration)) {
      errors.sessionDuration = "Thời lượng phiên không hợp lệ"
    }

    Object.entries(workPlansData.days).forEach(([dayKey, dayData]) => {
      if (dayData.enabled) {
        if (dayData.timeSlots.length === 0) {
          errors[`${dayKey}_slots`] = `${DAY_LABELS[dayKey as DayKey]} phải có ít nhất 1 khung giờ`
        }

        dayData.timeSlots.forEach((slot, index) => {
          const startTime = slot.startTime
          const endTime = slot.endTime

          if (!startTime || !endTime) {
            errors[`${dayKey}_slot_${index}`] = "Thời gian bắt đầu và kết thúc không được để trống"
            return
          }

          const [startHour, startMinute] = startTime.split(":").map(Number)
          const [endHour, endMinute] = endTime.split(":").map(Number)
          const startMinutes = startHour * 60 + startMinute
          const endMinutes = endHour * 60 + endMinute

          if (startMinutes >= endMinutes) {
            errors[`${dayKey}_slot_${index}`] = "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc"
          }
        })

        const sortedSlots = [...dayData.timeSlots].sort((a, b) => {
          const [aHour, aMin] = a.startTime.split(":").map(Number)
          const [bHour, bMin] = b.startTime.split(":").map(Number)
          return aHour * 60 + aMin - (bHour * 60 + bMin)
        })

        for (let i = 0; i < sortedSlots.length - 1; i++) {
          const current = sortedSlots[i]
          const next = sortedSlots[i + 1]
          const [currentEndHour, currentEndMin] = current.endTime.split(":").map(Number)
          const [nextStartHour, nextStartMin] = next.startTime.split(":").map(Number)
          const currentEndMinutes = currentEndHour * 60 + currentEndMin
          const nextStartMinutes = nextStartHour * 60 + nextStartMin

          if (currentEndMinutes > nextStartMinutes) {
            errors[`${dayKey}_overlap`] = `${DAY_LABELS[dayKey as DayKey]} có khung giờ bị trùng nhau`
            break
          }
        }
      }
    })

    setWorkPlansErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveWorkPlans = async () => {
    if (!validateWorkPlans()) {
      toast({
        title: "Lỗi validation",
        description: "Vui lòng kiểm tra lại thông tin đã nhập",
        variant: "destructive",
      })
      return
    }

    setIsSavingWorkPlans(true)
    try {
      const dayMap: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 7,
      }

      const request: UpdateWorkScheduleRequest = {
        sessionDuration: workPlansData.sessionDuration,
        appointmentCost: workPlansData.appointmentCost,
        days: Object.entries(workPlansData.days).map(([dayKey, dayData]) => ({
          weekday: dayMap[dayKey],
          enabled: dayData.enabled,
          timeSlots: dayData.enabled
            ? dayData.timeSlots.map((slot) => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
              }))
            : [],
        })),
      }

      const updatedSchedule = await userService.updateWorkSchedule(request)
      const updatedWorkPlansData = scheduleToWorkPlansData(updatedSchedule)

      setWorkPlansData(updatedWorkPlansData)
      setOriginalWorkPlansData(updatedWorkPlansData)
      setWorkPlansErrors({})

      toast({
        title: "Lưu thành công",
        description: "Lịch làm việc đã được cập nhật thành công",
      })
    } catch (error: unknown) {
      console.error("Error saving work plans:", error)
      const message = error instanceof Error ? error.message : "Không thể lưu lịch làm việc. Vui lòng thử lại sau."
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSavingWorkPlans(false)
    }
  }

  const handleCancelWorkPlans = () => {
    setWorkPlansData(originalWorkPlansData)
    setWorkPlansErrors({})
  }

  if (isLoadingWorkSchedule) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="glass rounded-3xl p-6 shadow-soft-lg border-white/50 hover-lift">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="sessionDuration">
              Thời lượng phiên (phút) <span className="text-red-500">*</span>
            </Label>
            <Select
              value={workPlansData.sessionDuration.toString()}
              onValueChange={(value) =>
                setWorkPlansData({ ...workPlansData, sessionDuration: parseInt(value) })
              }
            >
              <SelectTrigger className={cn(workPlansErrors.sessionDuration && "border-red-500")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 phút</SelectItem>
                <SelectItem value="15">15 phút</SelectItem>
                <SelectItem value="20">20 phút</SelectItem>
                <SelectItem value="30">30 phút</SelectItem>
                <SelectItem value="60">60 phút</SelectItem>
              </SelectContent>
            </Select>
            {workPlansErrors.sessionDuration && (
              <p className="text-sm text-red-500 mt-1">{workPlansErrors.sessionDuration}</p>
            )}
          </div>

          <div>
            <Label htmlFor="appointmentCost">
              Giá khám (VND) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="appointmentCost"
              type="number"
              min="0"
              value={workPlansData.appointmentCost}
              onChange={(e) =>
                setWorkPlansData({ ...workPlansData, appointmentCost: parseInt(e.target.value) || 0 })
              }
              className={cn(workPlansErrors.appointmentCost && "border-red-500")}
            />
            {workPlansErrors.appointmentCost && (
              <p className="text-sm text-red-500 mt-1">{workPlansErrors.appointmentCost}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Cấu hình lịch làm việc theo ngày</h3>
          <div className="space-y-4">
            {Object.entries(workPlansData.days).map(([dayKey, dayData]) => (
              <div
                key={dayKey}
                className={cn(
                  "border rounded-lg p-4 space-y-3",
                  !dayData.enabled && "opacity-50 bg-gray-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={dayData.enabled}
                      onCheckedChange={() => toggleDayEnabled(dayKey as DayKey)}
                    />
                    <Label className="text-base font-medium cursor-pointer" htmlFor={dayKey}>
                      {DAY_LABELS[dayKey as DayKey]}
                    </Label>
                  </div>
                  {dayData.enabled && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot(dayKey as DayKey)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm khung giờ
                    </Button>
                  )}
                </div>

                {dayData.enabled && (
                  <div className="space-y-3 pl-8">
                    {workPlansErrors[`${dayKey}_slots`] && (
                      <p className="text-sm text-red-500">{workPlansErrors[`${dayKey}_slots`]}</p>
                    )}
                    {workPlansErrors[`${dayKey}_overlap`] && (
                      <p className="text-sm text-red-500">{workPlansErrors[`${dayKey}_overlap`]}</p>
                    )}

                    {dayData.timeSlots.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Chưa có khung giờ nào</p>
                    ) : (
                      dayData.timeSlots.map((slot, slotIndex) => (
                        <div
                          key={slotIndex}
                          className="flex items-center gap-3 p-3 bg-white rounded-md border"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) =>
                                  updateTimeSlot(dayKey as DayKey, slotIndex, "startTime", e.target.value)
                                }
                                className={cn(
                                  "w-32",
                                  workPlansErrors[`${dayKey}_slot_${slotIndex}`] && "border-red-500"
                                )}
                              />
                              <span className="text-gray-500">-</span>
                              <Input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) =>
                                  updateTimeSlot(dayKey as DayKey, slotIndex, "endTime", e.target.value)
                                }
                                className={cn(
                                  "w-32",
                                  workPlansErrors[`${dayKey}_slot_${slotIndex}`] && "border-red-500"
                                )}
                              />
                            </div>
                            {workPlansErrors[`${dayKey}_slot_${slotIndex}`] && (
                              <p className="text-xs text-red-500">
                                {workPlansErrors[`${dayKey}_slot_${slotIndex}`]}
                              </p>
                            )}
                          </div>
                          {dayData.timeSlots.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTimeSlot(dayKey as DayKey, slotIndex)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelWorkPlans}
            disabled={isSavingWorkPlans}
            className="glass border-[#007A94] text-[#007A94] hover:bg-white/50 transition-smooth"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSaveWorkPlans}
            disabled={isSavingWorkPlans}
            className="gradient-primary hover:opacity-90 text-white shadow-soft-lg hover:shadow-soft-xl transition-smooth"
          >
            {isSavingWorkPlans ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Lưu lịch
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
