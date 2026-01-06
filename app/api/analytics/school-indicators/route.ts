import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supervisions = await prisma.supervision.findMany({
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        indicators: true,
      },
    })

    const schoolStats: Record<
      string,
      {
        school: string
        EXCELLENT: number
        GOOD: number
        FAIR: number
        NEEDS_WORK: number
      }
    > = {}

    supervisions.forEach((supervision) => {
      const schoolId = supervision.school.id
      const schoolName = supervision.school.name

      if (!schoolStats[schoolId]) {
        schoolStats[schoolId] = {
          school: schoolName,
          EXCELLENT: 0,
          GOOD: 0,
          FAIR: 0,
          NEEDS_WORK: 0,
        }
      }

      supervision.indicators.forEach((indicator) => {
        schoolStats[schoolId][indicator.level]++
      })
    })

    const schoolComparisonData = Object.values(schoolStats)
      .filter((stat) => stat.EXCELLENT + stat.GOOD + stat.FAIR + stat.NEEDS_WORK > 0)
      .sort((a, b) => {
        const totalA = a.EXCELLENT + a.GOOD + a.FAIR + a.NEEDS_WORK
        const totalB = b.EXCELLENT + b.GOOD + b.FAIR + b.NEEDS_WORK
        return totalB - totalA
      })
      .slice(0, 10) // Top 10 schools

    return NextResponse.json({ schools: schoolComparisonData })
  } catch (error) {
    console.error('Error fetching school indicators data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

