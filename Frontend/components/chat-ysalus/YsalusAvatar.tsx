"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface YsalusAvatarProps {
  src: string
  alt?: string
  size?: "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge" | "custom"
  status?: "online" | "offline" | "busy" | "none"
  className?: string
}

const sizeClasses = {
  xsmall: "h-6 w-6 max-w-6 text-xs",
  small: "h-8 w-8 max-w-8 text-xs",
  medium: "h-10 w-10 max-w-10 text-xs",
  large: "h-12 w-12 max-w-12 text-sm",
  xlarge: "h-14 w-14 max-w-14 text-sm",
  xxlarge: "h-16 w-16 max-w-16 text-sm",
  custom: "",
}

const statusSizeClasses = {
  xsmall: "h-1.5 w-1.5 max-w-1.5",
  small: "h-2 w-2 max-w-2",
  medium: "h-2.5 w-2.5 max-w-2.5",
  large: "h-3 w-3 max-w-3",
  xlarge: "h-3.5 w-3.5 max-w-3.5",
  xxlarge: "h-4 w-4 max-w-4",
  custom: "",
}

const statusColorClasses: Record<string, string> = {
  online: "bg-success-500",
  offline: "bg-error-400",
  busy: "bg-warning-500",
}

export function YsalusAvatar({
  src,
  alt = "User Avatar",
  size = "medium",
  status = "none",
  className,
}: YsalusAvatarProps) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className={cn("relative rounded-full", sizeClasses[size], className)}>
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className={cn("object-cover rounded-full w-full h-full", className)}
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-gray-200 w-full h-full text-gray-700",
            sizeClasses[size]
          )}
        >
          {alt.substring(0, 2).toUpperCase()}
        </div>
      )}

      {status !== "none" && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-[1.5px] border-white",
            statusSizeClasses[size],
            statusColorClasses[status] ?? ""
          )}
        />
      )}
    </div>
  )
}
