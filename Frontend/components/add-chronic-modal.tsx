"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AddChronicModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (conditions: string[]) => void
  currentConditions: string[]
}

export function AddChronicModal({ open, onOpenChange, onAdd, currentConditions }: AddChronicModalProps) {
  const [selectedChronic, setSelectedChronic] = useState<string[]>([])
  const [customChronic, setCustomChronic] = useState("")

  const chronicOptions = [
    "Diabetes",
    "Hypertension",
    "Asthma",
    "Cardiovascular Disease",
    "Arthritis",
    "Hepatitis B/C",
    "Stomach pain",
    "Others",
  ]

  const handleChronicChange = (condition: string, checked: boolean) => {
    if (checked) {
      setSelectedChronic([...selectedChronic, condition])
    } else {
      setSelectedChronic(selectedChronic.filter((c) => c !== condition))
    }
  }

  const handleAdd = () => {
    const newConditions = [...selectedChronic]
    if (customChronic.trim() && selectedChronic.includes("Others")) {
      newConditions.push(customChronic.trim())
    }
    onAdd(newConditions.map((c) => c.toUpperCase()))
    setSelectedChronic([])
    setCustomChronic("")
    onOpenChange(false)
  }

  const canAdd = selectedChronic.length > 0 || customChronic.trim().length > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-gray-900">CHRONIC CONDITIONS</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="grid grid-cols-3 gap-6 py-4">
          {chronicOptions.map((condition) => (
            <div key={condition} className="flex items-center space-x-2">
              <Checkbox
                id={condition}
                checked={selectedChronic.includes(condition)}
                onCheckedChange={(checked) => handleChronicChange(condition, checked as boolean)}
              />
              <label htmlFor={condition} className="text-sm text-gray-700 cursor-pointer">
                {condition}
              </label>
            </div>
          ))}
        </div>

        {selectedChronic.includes("Others") && (
          <div className="mt-2">
            <Input
              placeholder="Enter other condition..."
              value={customChronic}
              onChange={(e) => setCustomChronic(e.target.value)}
              className="border-gray-300 rounded-lg"
            />
          </div>
        )}

        <AlertDialogFooter className="flex justify-end space-x-3">
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6"
          >
            Close
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAdd}
            disabled={!canAdd}
            className={`rounded-full px-6 ${canAdd ? "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            Add
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
