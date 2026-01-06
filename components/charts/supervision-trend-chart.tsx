'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SupervisionTrendChartProps {
  data: Array<{
    month: string
    count: number
    approved: number
  }>
}

export function SupervisionTrendChart({ data }: SupervisionTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="count" stroke="#8884d8" name="ทั้งหมด" />
        <Line type="monotone" dataKey="approved" stroke="#82ca9d" name="อนุมัติแล้ว" />
      </LineChart>
    </ResponsiveContainer>
  )
}

