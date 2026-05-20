"use client"

import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSidebarExpanded, type SidebarRole } from "@/hooks/use-sidebar-expanded"

type SidebarToggleProps = {
  role: SidebarRole
  className?: string
}

/** Toggle in main header (ysalus-style), not inside the sidebar. */
export function SidebarToggle({ role, className }: SidebarToggleProps) {
  const { toggle } = useSidebarExpanded(role)

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      className={cn(
        "h-9 w-9 shrink-0 rounded-lg border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50",
        className
      )}
      aria-label="Thu gọn hoặc mở rộng menu"
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  )
}
