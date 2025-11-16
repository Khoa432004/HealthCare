"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DoctorStatisticsFilter } from "@/services/doctor-statistics.service"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface StatisticsFilterProps {
  currentFilter: DoctorStatisticsFilter
  onFilterChange: (filter: DoctorStatisticsFilter) => void
}

export default function StatisticsFilter({ currentFilter, onFilterChange }: StatisticsFilterProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>(
    currentFilter.fromDate ? new Date(currentFilter.fromDate) : undefined
  )
  const [toDate, setToDate] = useState<Date | undefined>(
    currentFilter.toDate ? new Date(currentFilter.toDate) : undefined
  )
  const [selectedPeriod, setSelectedPeriod] = useState<string>(currentFilter.period || 'today')

  const periodOptions = [
    { value: 'today', label: 'Hôm nay' },
    { value: 'yesterday', label: 'Hôm qua' },
    { value: 'last7days', label: '7 ngày gần đây' },
    { value: 'thisMonth', label: 'Tháng này' },
    { value: 'custom', label: 'Tùy chọn' },
  ]

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    if (period !== 'custom') {
      onFilterChange({ period: period as any })
    }
  }

  const handleApplyCustom = () => {
    if (fromDate && toDate) {
      onFilterChange({
        period: 'custom',
        fromDate: format(fromDate, 'yyyy-MM-dd'),
        toDate: format(toDate, 'yyyy-MM-dd'),
      })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Khoảng thời gian</label>
        <div className="flex flex-wrap gap-2">
          {periodOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedPeriod === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange(option.value)}
              className={selectedPeriod === option.value ? "bg-[#16a1bd] text-white" : ""}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {selectedPeriod === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Từ ngày</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={(date) => setFromDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Đến ngày</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={(date) => setToDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {selectedPeriod === 'custom' && (
        <Button
          onClick={handleApplyCustom}
          className="w-full bg-[#16a1bd] text-white"
          disabled={!fromDate || !toDate}
        >
          Áp dụng
        </Button>
      )}
    </div>
  )
}

