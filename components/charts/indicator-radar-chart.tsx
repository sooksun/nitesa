'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface IndicatorRadarChartProps {
  data: Array<{
    name: string
    EXCELLENT: number
    GOOD: number
    FAIR: number
    NEEDS_WORK: number
  }>
}

export function IndicatorRadarChart({ data }: IndicatorRadarChartProps) {
  // Transform data for radar chart
  const radarData = data.map((item) => ({
    indicator: item.name,
    'ดีเยี่ยม': item.EXCELLENT,
    'ดี': item.GOOD,
    'พอใช้': item.FAIR,
    'ต้องพัฒนา': item.NEEDS_WORK,
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={radarData}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="indicator"
          tick={{ fontSize: 12 }}
          className="text-sm"
        />
        <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
        <Radar
          name="ดีเยี่ยม"
          dataKey="ดีเยี่ยม"
          stroke="#22c55e"
          fill="#22c55e"
          fillOpacity={0.6}
        />
        <Radar
          name="ดี"
          dataKey="ดี"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
        <Radar
          name="พอใช้"
          dataKey="พอใช้"
          stroke="#eab308"
          fill="#eab308"
          fillOpacity={0.6}
        />
        <Radar
          name="ต้องพัฒนา"
          dataKey="ต้องพัฒนา"
          stroke="#ef4444"
          fill="#ef4444"
          fillOpacity={0.6}
        />
        <Tooltip />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}

