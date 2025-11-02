"use client"

import { AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBannerProps {
  message: string
  onClose?: () => void
  type?: "error" | "warning" | "info"
}

export function ErrorBanner({ message, onClose, type = "error" }: ErrorBannerProps) {
  const bgColor = type === "error" 
    ? "bg-red-50 border-red-200 text-red-800"
    : type === "warning"
    ? "bg-yellow-50 border-yellow-200 text-yellow-800"
    : "bg-blue-50 border-blue-200 text-blue-800"

  return (
    <div className={`${bgColor} border rounded-lg p-4 mb-4 flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="font-medium">{message}</p>
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 hover:bg-transparent"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}

