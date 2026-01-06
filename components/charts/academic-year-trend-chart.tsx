'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AcademicYearTrendChartProps {
  data: Array<{
    year: string
    count: number
  }>
}

export function AcademicYearTrendChart({ data }: AcademicYearTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#e300a8"
          fill="#e300a8"
          fillOpacity={0.6}
          name="จำนวนการนิเทศ"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

