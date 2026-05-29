import { CheckCircle, Clock, Stethoscope } from "lucide-react"
import type { BookingStep } from "./types"

type Props = {
  currentStep: BookingStep
}

export function BookingStepProgress({ currentStep }: Props) {
  const steps = [
    { step: 1 as BookingStep, icon: Stethoscope, label: "Pick Doctor" },
    { step: 2 as BookingStep, icon: Clock, label: "Details" },
    { step: 3 as BookingStep, icon: CheckCircle, label: "Confirm" },
  ]

  return (
    <div className="flex items-center justify-center gap-6 mb-8">
      {steps.map((item, index) => {
        const Icon = item.icon
        const active = currentStep >= item.step
        return (
          <div key={item.step} className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  active ? "bg-[#007A94] text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p className={`mt-2 text-sm ${active ? "text-[#007A94] font-semibold" : "text-gray-500"}`}>
                Step {item.step}: {item.label}
              </p>
            </div>
            {index < steps.length - 1 ? (
              <div className={`h-0.5 w-12 ${currentStep > item.step ? "bg-[#007A94]" : "bg-gray-200"}`} />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
