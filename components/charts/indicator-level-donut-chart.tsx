'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface IndicatorLevelDonutChartProps {
  data: Array<{
    level: string
    count: number
  }>
}

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444']

const LEVEL_LABELS: Record<string, string> = {
  EXCELLENT: 'ดีเยี่ยม',
  GOOD: 'ดี',
  FAIR: 'พอใช้',
  NEEDS_WORK: 'ต้องพัฒนา',
}

export function IndicatorLevelDonutChart({ data }: IndicatorLevelDonutChartProps) {
  const chartData = data.map((item) => ({
    name: LEVEL_LABELS[item.level] || item.level,
    value: item.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={100}
          innerRadius={60}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

