"use client"

import { useState, useEffect } from "react"
import { Trash2, FileText, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { medicalReportService, type MedicalReport, type VitalSign as VitalSignType, type Medication as MedicationType } from "@/services/medical-report.service"

interface VitalSign {
  id: string
  name: string
  unit: string
  value: string
}

interface Medication {
  id: string
  medicationName: string
  medicationDosage: string
  medicationType: string
  medicationMealTiming: string
  durationDays?: number
  startDate?: string
  note?: string
}

interface MedicalReportTabProps {
  appointmentId?: string
  appointmentStatus?: string
}

// Available vital signs with their units
const AVAILABLE_VITAL_SIGNS = [
  { id: 'temperature', name: 'Temperature', unit: '°C' },
  { id: 'bloodGlucose', name: 'Blood glucose', unit: 'mg/dL' },
  { id: 'bloodPressure', name: 'Blood pressure', unit: 'mmHg' },
  { id: 'cholesterol', name: 'Cholesterol', unit: 'mg/dL' },
  { id: 'heartRate', name: 'Heart rate', unit: 'bpm' },
  { id: 'respiratoryRate', name: 'Respiratory rate', unit: 'breaths/min' },
  { id: 'spO2', name: 'SpO₂', unit: '%' },
  { id: 'weight', name: 'Weight', unit: 'kg' },
]

export default function MedicalReportTab({ appointmentId, appointmentStatus }: MedicalReportTabProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [existingReport, setExistingReport] = useState<MedicalReport | null>(null)
  const [selectedVitalSigns, setSelectedVitalSigns] = useState<string[]>([])
  const [vitalSignValues, setVitalSignValues] = useState<Record<string, string>>({})
  const [showVitalSignsSelector, setShowVitalSignsSelector] = useState(false)
  const [medications, setMedications] = useState<Medication[]>([])
  const [medicineForms, setMedicineForms] = useState<Array<{
    id: string
    medicationName: string
    medicationDosage: string
    medicationType: string
    medicationMealTiming: string
    durationDays?: number
    startDate?: string
    note?: string
  }>>([])

  const [form, setForm] = useState({
    clinic: "",
    province: "",
    chronicConditions: "",
    illness: "",
    medicalExam: "",
    icdCode: "",
    diagnosis: "",
    coverage: "",
    recommendation: "",
    note: "",
    followUpDate: "",
  })

  // Load existing medical report
  useEffect(() => {
    if (appointmentId) {
      loadMedicalReport()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId])

  const loadMedicalReport = async () => {
    if (!appointmentId) return
    
    try {
      setIsLoading(true)
      const report = await medicalReportService.getByAppointmentId(appointmentId)
      
      if (report) {
        setExistingReport(report)
        
        // Load form data
        setForm({
          clinic: report.clinic || "",
          province: report.province || "",
          chronicConditions: report.chronicConditions || "",
          illness: report.illness || "",
          medicalExam: report.medicalExam || "",
          icdCode: report.icdCode || "",
          diagnosis: report.diagnosis || "",
          coverage: report.coverage || "",
          recommendation: report.recommendation || "",
          note: report.note || "",
          followUpDate: report.followUpDate || "",
        })
        
        // Load vital signs
        if (report.vitalSigns && report.vitalSigns.length > 0) {
          const selected: string[] = []
          const values: Record<string, string> = {}
          
          report.vitalSigns.forEach(vs => {
            const vitalSign = AVAILABLE_VITAL_SIGNS.find(v => v.name === vs.signType)
            if (vitalSign) {
              selected.push(vitalSign.id)
              values[vitalSign.id] = vs.value
            }
          })
          
          setSelectedVitalSigns(selected)
          setVitalSignValues(values)
        }
        
        // Load medications
        if (report.medications && report.medications.length > 0) {
          const meds: Medication[] = report.medications.map((med, index) => ({
            id: `${index}`,
            medicationName: med.medicationName,
            medicationDosage: med.dosage,
            medicationType: med.medicationType,
            medicationMealTiming: med.mealRelation,
            durationDays: med.durationDays,
            startDate: med.startDate,
            note: med.note,
          }))
          setMedications(meds)
        }
      } else {
        // No report found - this is normal for new appointments
        setExistingReport(null)
      }
    } catch (error: any) {
      console.error('Error loading medical report:', error)
      const errorMessage = error.message || "Không thể tải báo cáo y tế"
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
      // Set existing report to null on error to show empty state
      setExistingReport(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVitalSignToggle = (vitalSignId: string) => {
    if (selectedVitalSigns.includes(vitalSignId)) {
      // Remove from selection
      setSelectedVitalSigns(selectedVitalSigns.filter(id => id !== vitalSignId))
      // Clear value
      const newValues = { ...vitalSignValues }
      delete newValues[vitalSignId]
      setVitalSignValues(newValues)
    } else {
      // Add to selection
      setSelectedVitalSigns([...selectedVitalSigns, vitalSignId])
      // Initialize value to empty
      setVitalSignValues({ ...vitalSignValues, [vitalSignId]: "" })
    }
  }

  const handleVitalSignValueChange = (vitalSignId: string, value: string) => {
    setVitalSignValues({ ...vitalSignValues, [vitalSignId]: value })
  }

  const addMedicineForm = () => {
    const newFormId = Date.now().toString()
    setMedicineForms([
      ...medicineForms,
      {
        id: newFormId,
        medicationName: "",
        medicationDosage: "",
        medicationType: "",
        medicationMealTiming: "before-meal",
        durationDays: undefined,
        startDate: "",
        note: "",
      },
    ])
  }

  const removeMedicineForm = (formId: string) => {
    setMedicineForms(medicineForms.filter(f => f.id !== formId))
  }

  const updateMedicineForm = (formId: string, updates: Partial<typeof medicineForms[0]>) => {
    setMedicineForms(medicineForms.map(f => f.id === formId ? { ...f, ...updates } : f))
  }

  const addMedicationFromForm = (formId: string) => {
    const form = medicineForms.find(f => f.id === formId)
    if (!form || !form.medicationName || !form.medicationDosage || !form.medicationType) {
      return // Basic validation
    }
    
    const newMedication: Medication = {
      id: Date.now().toString(),
      medicationName: form.medicationName,
      medicationDosage: form.medicationDosage,
      medicationType: form.medicationType,
      medicationMealTiming: form.medicationMealTiming,
      durationDays: form.durationDays,
      startDate: form.startDate,
      note: form.note,
    }
    
    setMedications([...medications, newMedication])
    
    // Reset form but keep it open
    updateMedicineForm(formId, {
      medicationName: "",
      medicationDosage: "",
      medicationType: "",
      medicationMealTiming: "before-meal",
      durationDays: undefined,
      startDate: "",
      note: "",
    })
  }

  const removeMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id))
  }

  const prepareRequest = () => {
    // Convert vital signs to API format
    const vitalSigns: VitalSignType[] = selectedVitalSigns
      .map(id => {
        const vitalSign = AVAILABLE_VITAL_SIGNS.find(vs => vs.id === id)
        if (!vitalSign) return null
        return {
          signType: vitalSign.name,
          value: vitalSignValues[id] || "",
          unit: vitalSign.unit,
        }
      })
      .filter((vs): vs is VitalSignType => vs !== null)

    // Combine existing medications with those from open forms
    const allMedications: Medication[] = [
      ...medications,
      ...medicineForms.filter(f => f.medicationName && f.medicationDosage && f.medicationType)
    ]

    // Convert medications to API format
    const medicationsData: MedicationType[] = allMedications.map(med => ({
      medicationName: med.medicationName,
      dosage: med.medicationDosage,
      medicationType: med.medicationType,
      mealRelation: med.medicationMealTiming,
      durationDays: med.durationDays,
      startDate: med.startDate,
      note: med.note,
    }))

    return {
      appointmentId: appointmentId || "",
      clinic: form.clinic || undefined,
      province: form.province || undefined,
      chronicConditions: form.chronicConditions || undefined,
      illness: form.illness || undefined,
      medicalExam: form.medicalExam || undefined,
      icdCode: form.icdCode || undefined,
      diagnosis: form.diagnosis || undefined,
      coverage: form.coverage || undefined,
      recommendation: form.recommendation || undefined,
      note: form.note || undefined,
      followUpDate: form.followUpDate || undefined,
      vitalSigns: vitalSigns.length > 0 ? vitalSigns : undefined,
      medications: medicationsData.length > 0 ? medicationsData : undefined,
    }
  }

  const handleSaveDraft = async () => {
    if (!appointmentId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy ID lịch hẹn",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const request = prepareRequest()
      await medicalReportService.saveDraft(request)
      
      toast({
        title: "Thành công",
        description: "Đã lưu báo cáo y tế dưới dạng bản nháp",
      })
      
      // Reload report
      await loadMedicalReport()
    } catch (error: any) {
      console.error('Error saving draft:', error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu báo cáo y tế",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompleteReport = async () => {
    if (!appointmentId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy ID lịch hẹn",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!form.icdCode || form.icdCode.trim() === "") {
      toast({
        title: "Lỗi",
        description: "Mã ICD là bắt buộc khi hoàn thành báo cáo",
        variant: "destructive",
      })
      return
    }

    if (!form.diagnosis || form.diagnosis.trim() === "") {
      toast({
        title: "Lỗi",
        description: "Chẩn đoán là bắt buộc khi hoàn thành báo cáo",
        variant: "destructive",
      })
      return
    }

    if (!confirmed) {
      toast({
        title: "Lỗi",
        description: "Vui lòng xác nhận đã xem xét và xác minh tất cả thông tin y tế",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const request = prepareRequest()
      const report = await medicalReportService.completeReport(request)
      
      toast({
        title: "Thành công",
        description: "Đã hoàn thành báo cáo y tế. Lịch hẹn đã được đánh dấu là hoàn thành.",
      })
      
      // Reload report to show completed state
      await loadMedicalReport()
      
      // Reload appointment to get updated status
      if (window.location.pathname.includes('/appointment/')) {
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error: any) {
      console.error('Error completing report:', error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể hoàn thành báo cáo y tế",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const status = appointmentStatus?.toUpperCase()
  const isScheduled = status === 'SCHEDULED'
  const isInProcess = status === 'IN_PROCESS' || status === 'IN PROCESS'
  const isCompleted = status === 'COMPLETED'
  const reportCompleted = existingReport?.status === 'completed'
  const canEdit = isInProcess && !reportCompleted

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Medical Report</h3>
        {reportCompleted && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Completed
          </span>
        )}
      </div>

      {/* Empty State for SCHEDULED status */}
      {isScheduled && !existingReport && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Chưa có báo cáo y tế</h4>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Báo cáo y tế sẽ được tạo khi bác sĩ xác nhận khám và bắt đầu quá trình khám bệnh.
          </p>
        </div>
      )}

      {/* Form displayed directly in tab for IN_PROCESS status or when report exists */}
      {(isInProcess || existingReport) && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          {/* Form Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Báo cáo y tế</h2>
            {reportCompleted && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Đã hoàn thành
              </span>
            )}
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
              {/* Vital Signs Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900">Vital signs</h4>
                  {!showVitalSignsSelector && canEdit && (
                    <Button
                      onClick={() => setShowVitalSignsSelector(true)}
                      variant="outline"
                      size="sm"
                      className="rounded-full px-4 border-teal-600 text-teal-600 hover:bg-teal-50"
                      disabled={!canEdit}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  )}
                </div>
                
                {/* Checkbox list for selecting vital signs - only show when Add button is clicked */}
                {showVitalSignsSelector && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      {AVAILABLE_VITAL_SIGNS.map((vitalSign) => (
                        <div key={vitalSign.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={vitalSign.id}
                            checked={selectedVitalSigns.includes(vitalSign.id)}
                            onCheckedChange={() => handleVitalSignToggle(vitalSign.id)}
                            disabled={!canEdit}
                          />
                          <label
                            htmlFor={vitalSign.id}
                            className="text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            {vitalSign.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input fields for selected vital signs */}
                {selectedVitalSigns.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {selectedVitalSigns.map((vitalSignId) => {
                      const vitalSign = AVAILABLE_VITAL_SIGNS.find(vs => vs.id === vitalSignId)
                      if (!vitalSign) return null
                      
                      return (
                        <div key={vitalSignId}>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            {vitalSign.name} <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="0"
                              value={vitalSignValues[vitalSignId] || ""}
                              onChange={(e) => handleVitalSignValueChange(vitalSignId, e.target.value)}
                              className="pr-12"
                              disabled={!canEdit}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                              {vitalSign.unit}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Medicine Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900">Medicine</h4>
                  {canEdit && (
                    <Button
                      onClick={addMedicineForm}
                      variant="outline"
                      size="sm"
                      className="rounded-full px-4 border-teal-600 text-teal-600 hover:bg-teal-50"
                      disabled={!canEdit}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  )}
                </div>

                {/* List of added medications */}
                {medications.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {medications.map((medication) => (
                      <div key={medication.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-gray-900">{medication.medicationName}</p>
                              <span className="text-xs text-gray-500 capitalize">({medication.medicationType})</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-gray-600">Dosage</p>
                                <p className="font-medium text-gray-900">{medication.medicationDosage}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Use with meals</p>
                                <p className="font-medium text-gray-900 capitalize">
                                  {medication.medicationMealTiming.replace("-", " ")}
                                </p>
                              </div>
                            </div>
                            {(medication.durationDays || medication.startDate) && (
                              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                                {medication.durationDays && (
                                  <div>
                                    <p className="text-xs text-gray-600">Duration</p>
                                    <p className="font-medium text-gray-900">{medication.durationDays} days</p>
                                  </div>
                                )}
                                {medication.startDate && (
                                  <div>
                                    <p className="text-xs text-gray-600">Start date</p>
                                    <p className="font-medium text-gray-900">{medication.startDate}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {medication.note && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-600">Note</p>
                                <p className="font-medium text-gray-900">{medication.note}</p>
                              </div>
                            )}
                          </div>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMedication(medication.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                              disabled={!canEdit}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Medicine Forms - can have multiple forms */}
                {medicineForms.length > 0 && (
                  <div className="space-y-4 mb-4">
                    {medicineForms.map((form) => (
                      <div key={form.id} className="bg-white border border-gray-200 rounded-lg p-4 relative">
                        {canEdit && (
                          <button
                            onClick={() => removeMedicineForm(form.id)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            disabled={!canEdit}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                        
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Medication name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            placeholder="e.g., Aspirin"
                            value={form.medicationName}
                            onChange={(e) => updateMedicineForm(form.id, { medicationName: e.target.value })}
                            disabled={!canEdit}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Medication dosage <span className="text-red-500">*</span>
                            </label>
                            <Input
                              placeholder="e.g., 500mg"
                              value={form.medicationDosage}
                              onChange={(e) => updateMedicineForm(form.id, { medicationDosage: e.target.value })}
                              disabled={!canEdit}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Medication type <span className="text-red-500">*</span>
                            </label>
                            <Select
                              value={form.medicationType}
                              onValueChange={(value) => updateMedicineForm(form.id, { medicationType: value })}
                              disabled={!canEdit}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tablet">Tablet</SelectItem>
                                <SelectItem value="capsule">Capsule</SelectItem>
                                <SelectItem value="liquid">Liquid</SelectItem>
                                <SelectItem value="injection">Injection</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="text-sm font-medium text-gray-700 mb-3 block">Medication use with meals</label>
                          <div className="flex gap-2">
                            {[
                              { value: "before-meal", label: "Before meal" },
                              { value: "with-food", label: "With food" },
                              { value: "after-meal", label: "After meal" },
                              { value: "anytime", label: "Anytime" },
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => updateMedicineForm(form.id, { medicationMealTiming: option.value })}
                                disabled={!canEdit}
                                className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                                  form.medicationMealTiming === option.value
                                    ? "border-teal-600 bg-teal-50 text-teal-700"
                                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Duration (days)
                            </label>
                            <Input
                              type="number"
                              placeholder="e.g., 7"
                              value={form.durationDays || ""}
                              onChange={(e) => updateMedicineForm(form.id, { durationDays: e.target.value ? parseInt(e.target.value) : undefined })}
                              disabled={!canEdit}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Start date
                            </label>
                            <Input
                              type="date"
                              value={form.startDate || ""}
                              onChange={(e) => updateMedicineForm(form.id, { startDate: e.target.value })}
                              disabled={!canEdit}
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Note</label>
                          <textarea
                            placeholder="Enter medication note"
                            value={form.note || ""}
                            onChange={(e) => updateMedicineForm(form.id, { note: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                            rows={2}
                            disabled={!canEdit}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Report Information</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Clinic</label>
                    <Input
                      placeholder="Enter clinic name"
                      value={form.clinic}
                      onChange={(e) => setForm({ ...form, clinic: e.target.value })}
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Province</label>
                    <Input
                      placeholder="Enter province"
                      value={form.province}
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Chronic Conditions</label>
                  <textarea
                    placeholder="Enter chronic conditions"
                    value={form.chronicConditions}
                    onChange={(e) => setForm({ ...form, chronicConditions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    rows={2}
                    disabled={!canEdit}
                  />
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Illness</label>
                  <textarea
                    placeholder="Enter illness description"
                    value={form.illness}
                    onChange={(e) => setForm({ ...form, illness: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    rows={2}
                    disabled={!canEdit}
                  />
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Medical Exam</label>
                  <textarea
                    placeholder="Enter medical examination results"
                    value={form.medicalExam}
                    onChange={(e) => setForm({ ...form, medicalExam: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    rows={3}
                    disabled={!canEdit}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">ICD Code</label>
                    <Input
                      placeholder="Enter ICD code"
                      value={form.icdCode}
                      onChange={(e) => setForm({ ...form, icdCode: e.target.value })}
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Coverage</label>
                    <Input
                      placeholder="Enter coverage details"
                      value={form.coverage}
                      onChange={(e) => setForm({ ...form, coverage: e.target.value })}
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Diagnosis</label>
                  <textarea
                    placeholder="Enter diagnosis"
                    value={form.diagnosis}
                    onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    rows={3}
                    disabled={!canEdit}
                  />
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Recommendation</label>
                  <textarea
                    placeholder="Enter recommendations"
                    value={form.recommendation}
                    onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    rows={3}
                    disabled={!canEdit}
                  />
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
                  <textarea
                    placeholder="Enter additional notes"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    rows={3}
                    disabled={!canEdit}
                  />
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Follow-up date</label>
                  <Input
                    type="date"
                    value={form.followUpDate}
                    onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                    disabled={!canEdit}
                  />
                </div>
              </div>

                {canEdit && (
                  <div className="mt-4 flex items-center space-x-2">
                    <Checkbox
                      id="confirm"
                      checked={confirmed}
                      onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                      disabled={!canEdit}
                    />
                    <label htmlFor="confirm" className="text-sm text-gray-700">
                      I confirm that i have reviewed and verified all the medical information provided above.
                    </label>
                  </div>
                )}

              {/* Action Buttons - Only show if can edit */}
              {canEdit && (
                <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
                  <Button
                    onClick={handleSaveDraft}
                    disabled={isSaving || isLoading}
                    variant="outline"
                    className="rounded-full px-6 border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent"
                  >
                    {isSaving ? "Đang lưu..." : "Saving as draft"}
                  </Button>
                  <Button 
                    onClick={handleCompleteReport}
                    disabled={isSaving || isLoading || !confirmed}
                    className="gradient-primary text-white rounded-full px-6"
                  >
                    {isSaving ? "Đang hoàn thành..." : "Complete the report"}
                  </Button>
                </div>
              )}
              
              {/* Read-only message for completed reports */}
              {reportCompleted && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      Báo cáo y tế đã được hoàn thành và không thể chỉnh sửa.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

    </div>
  )
}
