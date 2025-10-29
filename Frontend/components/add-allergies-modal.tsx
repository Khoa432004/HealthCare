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

interface AddAllergiesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (allergies: string[]) => void
  currentAllergies: string[]
}

export function AddAllergiesModal({ open, onOpenChange, onAdd, currentAllergies }: AddAllergiesModalProps) {
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [customAllergies, setCustomAllergies] = useState("")

  const foodAllergies = ["Milk", "Eggs", "Peanuts", "Shellfish", "Tree nuts", "Others"]
  const drugAllergies = ["Antibiotics", "Painkillers", "Anesthesia"]

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    if (checked) {
      setSelectedAllergies([...selectedAllergies, allergy])
    } else {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== allergy))
    }
  }

  const handleAdd = () => {
    const newAllergies = [...selectedAllergies]
    if (customAllergies.trim()) {
      newAllergies.push(customAllergies.trim())
    }
    onAdd(newAllergies.map((a) => a.toUpperCase()))
    setSelectedAllergies([])
    setCustomAllergies("")
    onOpenChange(false)
  }

  const canAdd = selectedAllergies.length > 0 || customAllergies.trim().length > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-gray-900">ALLERGIES</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Food Allergies:</h3>
            <div className="grid grid-cols-2 gap-4">
              {foodAllergies.map((allergy) => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={allergy}
                    checked={selectedAllergies.includes(allergy)}
                    onCheckedChange={(checked) => handleAllergyChange(allergy, checked as boolean)}
                  />
                  <label htmlFor={allergy} className="text-sm text-gray-700 cursor-pointer">
                    {allergy}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Drug Allergies:</h3>
            <div className="grid grid-cols-3 gap-4">
              {drugAllergies.map((allergy) => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={allergy}
                    checked={selectedAllergies.includes(allergy)}
                    onCheckedChange={(checked) => handleAllergyChange(allergy, checked as boolean)}
                  />
                  <label htmlFor={allergy} className="text-sm text-gray-700 cursor-pointer">
                    {allergy}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Other Allergies:</h3>
            <Input
              placeholder="Enter other allergies..."
              value={customAllergies}
              onChange={(e) => setCustomAllergies(e.target.value)}
              className="border-gray-300 rounded-lg"
            />
          </div>
        </div>

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
