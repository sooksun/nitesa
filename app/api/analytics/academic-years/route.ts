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
      select: {
        academicYear: true,
      },
      where: {
        academicYear: {
          not: null,
        },
      },
    })

    const yearCounts: Record<string, number> = {}

    supervisions.forEach((supervision) => {
      const year = supervision.academicYear
      if (year) {
        yearCounts[year] = (yearCounts[year] || 0) + 1
      }
    })

    const yearData = Object.entries(yearCounts)
      .map(([year, count]) => ({
        year,
        count,
      }))
      .sort((a, b) => a.year.localeCompare(b.year))

    return NextResponse.json({ years: yearData })
  } catch (error) {
    console.error('Error fetching academic year data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

