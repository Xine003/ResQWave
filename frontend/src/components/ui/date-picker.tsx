"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onSelect,
  placeholder = "Select date",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(
    value ? value.getMonth() : new Date().getMonth()
  )
  const [currentYear, setCurrentYear] = React.useState(
    value ? value.getFullYear() : new Date().getFullYear()
  )

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, () => null)

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day)
    onSelect?.(selectedDate)
    setOpen(false)
  }

  const isSelected = (day: number) => {
    if (!value) return false
    return (
      value.getDate() === day &&
      value.getMonth() === currentMonth &&
      value.getFullYear() === currentYear
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between font-normal bg-[#171717] border border-[#404040] text-white hover:bg-[#171717] hover:text-white",
            !value && "text-gray-400",
            className
          )}
          disabled={disabled}
          style={{ fontSize: "16px", height: "48px" }}
        >
          {value ? value.toLocaleDateString() : placeholder}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 overflow-hidden p-0 bg-[#171717] border-[#404040] shadow-lg" align="start">
        <div className="p-4">
          {/* Header with month/year navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11)
                  setCurrentYear(currentYear - 1)
                } else {
                  setCurrentMonth(currentMonth - 1)
                }
              }}
              className="h-8 w-8 p-0 bg-transparent border-[#404040] text-white hover:bg-[#404040] hover:text-white"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-2">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="bg-[#171717] border border-[#404040] text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                {months.map((month, index) => (
                  <option key={month} value={index} className="bg-[#171717] text-white">
                    {month}
                  </option>
                ))}
              </select>
              
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="bg-[#171717] border border-[#404040] text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i).map((year) => (
                  <option key={year} value={year} className="bg-[#171717] text-white">
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0)
                  setCurrentYear(currentYear + 1)
                } else {
                  setCurrentMonth(currentMonth + 1)
                }
              }}
              className="h-8 w-8 p-0 bg-transparent border-[#404040] text-white hover:bg-[#404040] hover:text-white"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="h-10 w-10 text-center text-xs font-semibold text-gray-400 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {[...emptyDays, ...days].map((day, index) => (
              <button
                key={index}
                onClick={() => day && handleDateSelect(day)}
                disabled={!day}
                className={cn(
                  "h-10 w-10 text-sm rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#171717]",
                  !day && "invisible",
                  day && !isSelected(day) && !isToday(day) && "text-white hover:bg-[#404040] hover:text-white active:scale-95",
                  day && isToday(day) && !isSelected(day) && "bg-[#404040] text-white border border-[#606060] font-semibold",
                  day && isSelected(day) && "bg-blue-500 text-white hover:bg-blue-600 shadow-lg ring-2 ring-blue-500 ring-opacity-30 font-semibold"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}