'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Calendar } from 'lucide-react'
import { beDateStringToAD, adDateStringToBE, adToBe, beToAd } from '@/lib/date-utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DatePickerBECalendarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: string // AD date string (YYYY-MM-DD) from form
  onChange?: (value: string) => void // Returns AD date string (YYYY-MM-DD)
}

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

const thaiDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

export function DatePickerBECalendar({ value, onChange, className, ...props }: DatePickerBECalendarProps) {
  const [open, setOpen] = React.useState(false)
  const [beDisplay, setBeDisplay] = React.useState<string>(
    value ? adDateStringToBE(value) : ''
  )
  const [currentDate, setCurrentDate] = React.useState<Date>(() => {
    if (value) {
      const [year, month, day] = value.split('-').map(Number)
      return new Date(year, month - 1, day)
    }
    return new Date()
  })

  // Update display when value prop changes
  React.useEffect(() => {
    if (value) {
      const beDate = adDateStringToBE(value)
      setBeDisplay(beDate)
      const [year, month, day] = value.split('-').map(Number)
      setCurrentDate(new Date(year, month - 1, day))
    } else {
      setBeDisplay('')
    }
  }, [value])

  const handleBEDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value
    setBeDisplay(inputValue)

    // Auto-format as user types (dd/MM/yyyy)
    const cleaned = inputValue.replace(/\D/g, '')
    if (cleaned.length > 0) {
      let formatted = cleaned
      if (cleaned.length > 2) {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
      }
      if (cleaned.length > 4) {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`
      }
      inputValue = formatted
      setBeDisplay(inputValue)
    }

    // Validate and convert when complete (dd/MM/yyyy)
    const beDateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
    if (beDateRegex.test(inputValue)) {
      try {
        const adDateString = beDateStringToAD(inputValue)
        const [year, month, day] = adDateString.split('-').map(Number)
        setCurrentDate(new Date(year, month - 1, day))
        onChange?.(adDateString)
      } catch (error) {
        console.error('Invalid BE date:', error)
      }
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const handleDateSelect = (day: number) => {
    const { year, month } = getDaysInMonth(currentDate)
    const selectedDate = new Date(year, month, day)
    const adDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setCurrentDate(selectedDate)
    setBeDisplay(adDateStringToBE(adDateString))
    onChange?.(adDateString)
    setOpen(false)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handlePrevYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1))
  }

  const handleNextYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1))
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)
  const beYear = adToBe(year)
  const selectedDate = value ? (() => {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d)
  })() : null

  const days = []
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            {...props}
            type="text"
            value={beDisplay}
            onChange={handleBEDateChange}
            placeholder="dd/MM/yyyy (พ.ศ.)"
            maxLength={10}
            className={cn('pr-10', className)}
            readOnly
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            aria-label="เปิดปฏิทิน"
          >
            <Calendar className="h-4 w-4" />
          </button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={handlePrevYear}
              >
                <span className="text-xs">««</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={handlePrevMonth}
              >
                <span className="text-xs">«</span>
              </Button>
            </div>
            <div className="text-center font-semibold min-w-[180px]">
              {thaiMonths[month]} {beYear}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={handleNextMonth}
              >
                <span className="text-xs">»</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={handleNextYear}
              >
                <span className="text-xs">»»</span>
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {thaiDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground w-10">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="w-10 h-10" />
              }
              const isSelected = selectedDate && 
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year
              const isToday = new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    'w-10 h-10 rounded-md text-sm transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : isToday
                        ? 'bg-accent text-accent-foreground font-semibold'
                        : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

