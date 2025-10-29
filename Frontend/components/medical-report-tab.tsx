"use client"

import { useState } from "react"
import { Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MedicalRecord {
  id: string
  // Vital Signs
  temperature?: string
  bloodGlucose?: string
  // Lab Test
  labTestName?: string
  labTestResult?: string
  // Medicine
  medicationName?: string
  medicationDosage?: string
  medicationType?: string
  medicationMealTiming?: string
  medicationDosing?: {
    morning: number
    noon: number
    afternoon: number
    evening: number
  }
  // Report Info
  coveredBy?: string
  coverage?: string
  recommendation?: string
  notes?: string
  followUpDate?: string
  sendToEmail?: string
  confirmed?: boolean
}

export default function MedicalReportTab() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const [form, setForm] = useState({
    temperature: "",
    bloodGlucose: "",
    labTestName: "",
    labTestResult: "",
    medicationName: "",
    medicationDosage: "",
    medicationType: "",
    medicationMealTiming: "before-meal",
    medicationDosing: { morning: 0, noon: 0, afternoon: 0, evening: 0 },
    coveredBy: "",
    coverage: "",
    recommendation: "",
    notes: "",
    followUpDate: "",
    sendToEmail: "",
    confirmed: false,
  })

  const addRecord = () => {
    setRecords([
      ...records,
      {
        id: Date.now().toString(),
        ...form,
      },
    ])
    setForm({
      temperature: "",
      bloodGlucose: "",
      labTestName: "",
      labTestResult: "",
      medicationName: "",
      medicationDosage: "",
      medicationType: "",
      medicationMealTiming: "before-meal",
      medicationDosing: { morning: 0, noon: 0, afternoon: 0, evening: 0 },
      coveredBy: "",
      coverage: "",
      recommendation: "",
      notes: "",
      followUpDate: "",
      sendToEmail: "",
      confirmed: false,
    })
    setDialogOpen(false)
  }

  const deleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header with single Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Medical Report</h3>
        <Button onClick={() => setDialogOpen(true)} className="gradient-primary text-white rounded-full px-6 py-2">
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Dialog Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Wednesday, 29.10.2025, 02:19 PM</h2>
              <button onClick={() => setDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-6 space-y-6">
              {/* Vital Signs Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Vital signs</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Temperature <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., 37"
                      value={form.temperature}
                      onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Blood glucose <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., 100"
                      value={form.bloodGlucose}
                      onChange={(e) => setForm({ ...form, bloodGlucose: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Lab Test Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Lab Test</h4>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Lab test name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Blood Test"
                    value={form.labTestName}
                    onChange={(e) => setForm({ ...form, labTestName: e.target.value })}
                  />
                </div>
                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Result <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Normal"
                    value={form.labTestResult}
                    onChange={(e) => setForm({ ...form, labTestResult: e.target.value })}
                  />
                </div>
              </div>

              {/* Medicine Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Medicine</h4>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Medication name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Aspirin"
                    value={form.medicationName}
                    onChange={(e) => setForm({ ...form, medicationName: e.target.value })}
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
                      onChange={(e) => setForm({ ...form, medicationDosage: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Medication type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={form.medicationType}
                      onValueChange={(value) => setForm({ ...form, medicationType: value })}
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
                        onClick={() => setForm({ ...form, medicationMealTiming: option.value })}
                        className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                          form.medicationMealTiming === option.value
                            ? "border-teal-600 bg-teal-50 text-teal-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Dosing</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "morning", label: "Morning" },
                      { key: "noon", label: "Noon" },
                      { key: "afternoon", label: "Afternoon" },
                      { key: "evening", label: "Evening" },
                    ].map((time) => (
                      <div key={time.key} className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 mb-1">{time.label}</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setForm({
                                  ...form,
                                  medicationDosing: {
                                    ...form.medicationDosing,
                                    [time.key]: Math.max(
                                      0,
                                      form.medicationDosing[time.key as keyof typeof form.medicationDosing] - 1,
                                    ),
                                  },
                                })
                              }
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-medium">
                              {form.medicationDosing[time.key as keyof typeof form.medicationDosing]}
                            </span>
                            <button
                              onClick={() =>
                                setForm({
                                  ...form,
                                  medicationDosing: {
                                    ...form.medicationDosing,
                                    [time.key]:
                                      form.medicationDosing[time.key as keyof typeof form.medicationDosing] + 1,
                                  },
                                })
                              }
                              className="w-8 h-8 rounded-full border border-teal-600 text-teal-600 flex items-center justify-center hover:bg-teal-50"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Report Information</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Covered by</label>
                    <Input
                      placeholder="Enter coverage provider"
                      value={form.coveredBy}
                      onChange={(e) => setForm({ ...form, coveredBy: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Coverage</label>
                    <Input
                      placeholder="Enter coverage details"
                      value={form.coverage}
                      onChange={(e) => setForm({ ...form, coverage: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Recommendation</label>
                  <textarea
                    placeholder="Enter recommendations"
                    value={form.recommendation}
                    onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    rows={3}
                  />
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
                  <textarea
                    placeholder="Enter additional notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Follow-up date</label>
                    <Input
                      type="date"
                      value={form.followUpDate}
                      onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Send this report to doctor email
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={form.sendToEmail}
                      onChange={(e) => setForm({ ...form, sendToEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-2">
                  <Checkbox
                    id="confirm"
                    checked={form.confirmed}
                    onCheckedChange={(checked) => setForm({ ...form, confirmed: checked as boolean })}
                  />
                  <label htmlFor="confirm" className="text-sm text-gray-700">
                    I confirm that i have reviewed and verified all the medical information provided above.
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full px-6">
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-6 border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent"
                >
                  Saving as draft
                </Button>
                <Button onClick={addRecord} className="gradient-primary text-white rounded-full px-6">
                  Complete the report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Records Display */}
      {records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record, index) => (
            <div key={record.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Record {index + 1}</h4>
                <Button variant="ghost" size="icon" onClick={() => deleteRecord(record.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Vital Signs Display */}
                {(record.temperature || record.bloodGlucose) && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Vital signs</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {record.temperature && (
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">Temperature</p>
                          <p className="font-medium text-gray-900">{record.temperature}°C</p>
                        </div>
                      )}
                      {record.bloodGlucose && (
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs text-gray-600">Blood glucose</p>
                          <p className="font-medium text-gray-900">{record.bloodGlucose} mg/dL</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Lab Test Display */}
                {record.labTestName && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Lab Test</p>
                    <div className="bg-white p-3 rounded border border-gray-200 text-sm">
                      <p className="text-xs text-gray-600">Test Name</p>
                      <p className="font-medium text-gray-900">{record.labTestName}</p>
                      {record.labTestResult && (
                        <>
                          <p className="text-xs text-gray-600 mt-2">Result</p>
                          <p className="font-medium text-gray-900">{record.labTestResult}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Medicine Display */}
                {record.medicationName && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Medicine</p>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm space-y-2">
                      <div>
                        <p className="text-xs text-gray-600">Medication name</p>
                        <p className="font-medium text-gray-900">{record.medicationName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {record.medicationDosage && (
                          <div>
                            <p className="text-xs text-gray-600">Dosage</p>
                            <p className="font-medium text-gray-900">{record.medicationDosage}</p>
                          </div>
                        )}
                        {record.medicationType && (
                          <div>
                            <p className="text-xs text-gray-600">Type</p>
                            <p className="font-medium text-gray-900 capitalize">{record.medicationType}</p>
                          </div>
                        )}
                      </div>
                      {record.medicationMealTiming && (
                        <div>
                          <p className="text-xs text-gray-600">Use with meals</p>
                          <p className="font-medium text-gray-900 capitalize">
                            {record.medicationMealTiming.replace("-", " ")}
                          </p>
                        </div>
                      )}
                      {record.medicationDosing && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Dosing</p>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div className="text-center">
                              <p className="text-gray-600">Morning</p>
                              <p className="font-medium">{record.medicationDosing.morning}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Noon</p>
                              <p className="font-medium">{record.medicationDosing.noon}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Afternoon</p>
                              <p className="font-medium">{record.medicationDosing.afternoon}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Evening</p>
                              <p className="font-medium">{record.medicationDosing.evening}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Report Information Display */}
                {(record.coveredBy ||
                  record.coverage ||
                  record.recommendation ||
                  record.notes ||
                  record.followUpDate ||
                  record.sendToEmail) && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Report Information</p>
                    <div className="bg-teal-50 p-3 rounded border border-teal-200 text-sm space-y-2">
                      {record.coveredBy && (
                        <div>
                          <p className="text-xs text-gray-600">Covered by</p>
                          <p className="font-medium text-gray-900">{record.coveredBy}</p>
                        </div>
                      )}
                      {record.coverage && (
                        <div>
                          <p className="text-xs text-gray-600">Coverage</p>
                          <p className="font-medium text-gray-900">{record.coverage}</p>
                        </div>
                      )}
                      {record.recommendation && (
                        <div>
                          <p className="text-xs text-gray-600">Recommendation</p>
                          <p className="font-medium text-gray-900">{record.recommendation}</p>
                        </div>
                      )}
                      {record.notes && (
                        <div>
                          <p className="text-xs text-gray-600">Notes</p>
                          <p className="font-medium text-gray-900">{record.notes}</p>
                        </div>
                      )}
                      {record.followUpDate && (
                        <div>
                          <p className="text-xs text-gray-600">Follow-up date</p>
                          <p className="font-medium text-gray-900">{record.followUpDate}</p>
                        </div>
                      )}
                      {record.sendToEmail && (
                        <div>
                          <p className="text-xs text-gray-600">Send to email</p>
                          <p className="font-medium text-gray-900">{record.sendToEmail}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No medical records added yet</p>
      )}
    </div>
  )
}
