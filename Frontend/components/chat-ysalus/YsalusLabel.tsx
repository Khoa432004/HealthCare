import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface LabelProps {
  htmlFor?: string
  children: ReactNode
  className?: string
}

export function YsalusLabel({ htmlFor, children, className }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-1.5 block text-sm text-gray-700", className)}>
      {children}
    </label>
  )
}
