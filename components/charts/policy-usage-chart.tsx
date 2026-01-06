'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface PolicyUsageChartProps {
  data: Array<{
    type: string
    count: number
  }>
}

const COLORS = ['#e300a8', '#a855f7', '#3b82f6']

// Policy type labels - will be dynamically loaded from PolicyType enum
const POLICY_TYPE_LABELS: Record<string, string> = {}

export function PolicyUsageChart({ data }: PolicyUsageChartProps) {
  const chartData = data.map((item) => ({
    name: POLICY_TYPE_LABELS[item.type] || item.type,
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

