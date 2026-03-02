"use client"

import { cn } from "@/lib/utils"
import { MessageSquare, User, Stethoscope, Users, Headphones } from "lucide-react"
import type { InboxFilter } from "@/types/chat"
import { INBOX_FILTERS } from "@/types/chat"

const FILTER_ICONS: Record<InboxFilter, React.ComponentType<{ className?: string }>> = {
  all: MessageSquare,
  patient: User,
  doctor: Stethoscope,
  nurse: Users,
  receptionist: Headphones,
}

interface ChatFilterTabsProps {
  value: InboxFilter
  onChange: (filter: InboxFilter) => void
  /** Hide filters not relevant to role (e.g. Patient only sees Doctor/Admin) */
  allowedFilters?: InboxFilter[]
}

export function ChatFilterTabs({ value, onChange, allowedFilters }: ChatFilterTabsProps) {
  const filters = allowedFilters ? INBOX_FILTERS.filter((f) => allowedFilters.includes(f.id)) : INBOX_FILTERS

  return (
    <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-none">
      {filters.map((filter) => {
        const Icon = FILTER_ICONS[filter.id]
        const isActive = value === filter.id
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={cn(
              "relative flex items-center gap-1.5 h-8 px-3 py-1.5 rounded-[50px] shrink-0 font-medium text-sm transition-smooth whitespace-nowrap",
              isActive
                ? "bg-[#e5f5f8] border border-[#16a1bd] text-[#128197]"
                : "bg-[#f6f6f6] border border-transparent text-[#899091]"
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{filter.label}</span>
            {isActive && filter.id === "all" && (
              <span className="absolute right-1 top-1 w-2 h-2 rounded-full bg-red-500 border border-[#16a1bd]" />
            )}
          </button>
        )
      })}
    </div>
  )
}
