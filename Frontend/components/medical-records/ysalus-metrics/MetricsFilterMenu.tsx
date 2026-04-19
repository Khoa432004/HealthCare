"use client"

import { useEffect, useRef, useState } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import {
  getClientMetricFilterLabel,
  HEALTH_METRIC_FILTER_GROUPS,
} from "./healthMetricsFilter.constants"
import { FilterIcon } from "./icons"
import type { SelectOption } from "./types"

interface Props {
  selectedOptions: SelectOption[]
  setSelectedOptions: (values: SelectOption[]) => void
}

export const MetricsFilterMenu = ({
  selectedOptions,
  setSelectedOptions,
}: Props) => {
  const dropdownButtonRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [isOpen, setIsOpen] = useState<boolean>(false)

  function toggleDropdown() {
    setIsOpen((prev) => !prev)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative">
      <div
        ref={dropdownButtonRef}
        id="dropdownButton"
        className="relative h-10 w-10 max-w-10 text-xs rounded-full bg-brand-05 border border-brand-7 flex items-center justify-center cursor-pointer"
        onClick={toggleDropdown}
      >
        <span
          className={cn(
            "absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-error-500 border border-brand-05",
            selectedOptions.length > 0 ? "flex" : "hidden"
          )}
        >
          <span className="absolute inline-flex w-full h-full bg-error-500 rounded-full opacity-75" />
        </span>
        <FilterIcon className="size-4 text-brand-7" />
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          id="dropdownMenu"
          className="w-fit absolute right-0 mt-[10px] flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-lg z-9"
        >
          <div className="flex flex-col gap-2">
            {HEALTH_METRIC_FILTER_GROUPS.map((group) => (
              <div key={group.label} className="text-sm flex flex-col gap-2">
                <div className="py-2 border-b border-brand-1 truncate font-medium text-gray-900">
                  {group.label}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {group.clientFilterKeys.map((clientFilterKey, index) => {
                    const isLast = index === group.clientFilterKeys.length - 1
                    const isOdd = group.clientFilterKeys.length % 2 !== 0
                    const shouldFullSpan = isLast && isOdd
                    const isChecked = selectedOptions
                      .map((so) => so.value)
                      .includes(clientFilterKey)
                    const option = {
                      value: clientFilterKey,
                      label: getClientMetricFilterLabel(clientFilterKey),
                    }

                    return (
                      <label
                        key={clientFilterKey}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer select-none",
                          shouldFullSpan ? "col-span-2" : "col-span-1"
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const nextChecked = Boolean(checked)
                            if (nextChecked && selectedOptions.length < 5) {
                              setSelectedOptions([...selectedOptions, option])
                            } else {
                              setSelectedOptions(
                                selectedOptions.filter(
                                  (selectedOption) =>
                                    selectedOption.value !== clientFilterKey
                                )
                              )
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
