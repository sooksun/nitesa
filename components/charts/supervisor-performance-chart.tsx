'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SupervisorPerformanceChartProps {
  data: Array<{
    name: string
    total: number
    approved: number
    rate: number
  }>
}

export function SupervisorPerformanceChart({ data }: SupervisorPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="total" fill="#3b82f6" name="จำนวนทั้งหมด" />
        <Bar yAxisId="left" dataKey="approved" fill="#22c55e" name="อนุมัติแล้ว" />
        <Bar yAxisId="right" dataKey="rate" fill="#e300a8" name="อัตราการอนุมัติ (%)" />
      </BarChart>
    </ResponsiveContainer>
  )
}

