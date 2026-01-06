'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SchoolPerformanceChartProps {
  data: Array<{
    school: string
    score: number
    supervisions: number
  }>
}

export function SchoolPerformanceChart({ data }: SchoolPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="school" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="score" fill="#3b82f6" name="คะแนนเฉลี่ย" />
        <Bar dataKey="supervisions" fill="#10b981" name="จำนวนการนิเทศ" />
      </BarChart>
    </ResponsiveContainer>
  )
}

