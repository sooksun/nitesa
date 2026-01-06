'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface NetworkGroupChartProps {
  data: Array<{
    name: string
    count: number
  }>
}

export function NetworkGroupChart({ data }: NetworkGroupChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#e300a8" name="จำนวนการนิเทศ" />
      </BarChart>
    </ResponsiveContainer>
  )
}

