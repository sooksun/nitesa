'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PolicyByTypeChartProps {
  data: Array<{
    type: string
    [key: string]: string | number // Dynamic policy type counts
  }>
}

// Policy type labels - will be dynamically loaded from PolicyType enum
const POLICY_TYPE_LABELS: Record<string, string> = {}

export function PolicyByTypeChart({ data }: PolicyByTypeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        {/* Dynamic bars based on data keys - excluding 'type' */}
        {data.length > 0 &&
          Object.keys(data[0])
            .filter((key) => key !== 'type')
            .map((key, index) => {
              const colors = [
                '#e300a8',
                '#a855f7',
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6',
                '#06b6d4',
                '#ec4899',
                '#14b8a6',
                '#f97316',
                '#6366f1',
                '#84cc16',
                '#eab308',
                '#22c55e',
              ]
              return (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={colors[index % colors.length]}
                  name={POLICY_TYPE_LABELS[key] || key}
                />
              )
            })}
      </BarChart>
    </ResponsiveContainer>
  )
}

