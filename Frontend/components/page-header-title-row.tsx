"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarToggle } from "@/components/sidebar-toggle"
import type { SidebarRole } from "@/hooks/use-sidebar-expanded"

type PageHeaderTitleRowProps = {
  role: SidebarRole
  title: string
  icon?: LucideIcon
  iconClassName?: string
  titleClassName?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeaderTitleRow({
  role,
  title,
  icon: Icon,
  iconClassName,
  titleClassName,
  children,
  className,
}: PageHeaderTitleRowProps) {
  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <SidebarToggle role={role} />
      {Icon ? (
        <Icon className={cn("h-5 w-5 shrink-0 text-gray-700", iconClassName)} />
      ) : null}
      <h1
        className={cn(
          "text-xl font-semibold text-gray-900 truncate",
          titleClassName
        )}
      >
        {title}
      </h1>
      {children}
    </div>
  )
}
