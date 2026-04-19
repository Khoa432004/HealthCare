"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import { ChevronDownIcon } from "./icons"
import type { SelectOption } from "./types"

interface Props {
  options: SelectOption[]
  value?: string
  onChange: (option: SelectOption) => void
}

/**
 * Pill-styled dropdown that matches the ysalus DateTabs look
 * (rounded-full, brand-05 background, brand-7 border + text).
 */
export const DateRangeSelect = ({ options, value, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const current = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "h-10 px-4 rounded-full bg-brand-05 text-brand-7 font-semibold",
          "border border-brand-7 text-sm",
          "flex items-center gap-2 min-w-[110px] justify-between",
          "hover:bg-brand-1/40 transition-colors"
        )}
      >
        <span>{current?.label}</span>
        <ChevronDownIcon
          className={cn(
            "size-4 transition-transform",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      {isOpen && (
        <ul
          className={cn(
            "absolute right-0 mt-2 min-w-[140px]",
            "flex flex-col rounded-2xl border border-gray-200 bg-white p-1",
            "shadow-theme-lg z-9"
          )}
        >
          {options.map((option) => {
            const selected = option.value === current?.value
            return (
              <li key={option.value ?? option.label}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-sm",
                    "hover:bg-brand-05",
                    selected && "bg-brand-05 text-brand-7 font-semibold"
                  )}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
