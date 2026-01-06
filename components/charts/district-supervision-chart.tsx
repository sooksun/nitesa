'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DistrictSupervisionChartProps {
  data: Array<{
    name: string
    count: number
  }>
}

export function DistrictSupervisionChart({ data }: DistrictSupervisionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#3b82f6" name="จำนวนการนิเทศ" />
      </BarChart>
    </ResponsiveContainer>
  )
}

