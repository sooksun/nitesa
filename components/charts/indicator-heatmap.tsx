'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface IndicatorHeatmapProps {
  data: Array<{
    name: string
    EXCELLENT: number
    GOOD: number
    FAIR: number
    NEEDS_WORK: number
  }>
}

export function IndicatorHeatmap({ data }: IndicatorHeatmapProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="EXCELLENT" stackId="a" fill="#22c55e" name="ดีเยี่ยม" />
        <Bar dataKey="GOOD" stackId="a" fill="#3b82f6" name="ดี" />
        <Bar dataKey="FAIR" stackId="a" fill="#eab308" name="พอใช้" />
        <Bar dataKey="NEEDS_WORK" stackId="a" fill="#ef4444" name="ต้องพัฒนา" />
      </BarChart>
    </ResponsiveContainer>
  )
}

