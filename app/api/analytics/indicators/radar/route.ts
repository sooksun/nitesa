import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const indicators = await prisma.indicator.findMany({
      include: {
        supervision: true,
      },
    })

    // Group by indicator name and level
    const indicatorStats: Record<string, Record<string, number>> = {}
    indicators.forEach((indicator) => {
      if (!indicatorStats[indicator.name]) {
        indicatorStats[indicator.name] = {
          EXCELLENT: 0,
          GOOD: 0,
          FAIR: 0,
          NEEDS_WORK: 0,
        }
      }
      indicatorStats[indicator.name][indicator.level]++
    })

    const radarData = Object.entries(indicatorStats).map(([name, stats]) => ({
      name,
      EXCELLENT: stats.EXCELLENT || 0,
      GOOD: stats.GOOD || 0,
      FAIR: stats.FAIR || 0,
      NEEDS_WORK: stats.NEEDS_WORK || 0,
    }))

    return NextResponse.json({ indicators: radarData })
  } catch (error) {
    console.error('Error fetching indicator radar data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

