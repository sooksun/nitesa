'use client'

import * as React from 'react'
import { DatePickerBECalendar } from './date-picker-be-calendar'

interface DatePickerBEProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: string // AD date string (YYYY-MM-DD) from form
  onChange?: (value: string) => void // Returns AD date string (YYYY-MM-DD)
}

/**
 * Date picker component that displays BE (พ.ศ.) but stores AD (ค.ศ.) value
 * Uses custom calendar with BE year display
 */
export function DatePickerBE({ value, onChange, className, ...props }: DatePickerBEProps) {
  return (
    <DatePickerBECalendar
      value={value}
      onChange={onChange}
      className={className}
      {...props}
    />
  )
}

