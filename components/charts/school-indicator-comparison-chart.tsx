'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SchoolIndicatorComparisonChartProps {
  data: Array<{
    school: string
    EXCELLENT: number
    GOOD: number
    FAIR: number
    NEEDS_WORK: number
  }>
}

export function SchoolIndicatorComparisonChart({ data }: SchoolIndicatorComparisonChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="school" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="EXCELLENT" fill="#22c55e" name="ดีเยี่ยม" />
        <Bar dataKey="GOOD" fill="#3b82f6" name="ดี" />
        <Bar dataKey="FAIR" fill="#eab308" name="พอใช้" />
        <Bar dataKey="NEEDS_WORK" fill="#ef4444" name="ต้องพัฒนา" />
      </BarChart>
    </ResponsiveContainer>
  )
}

