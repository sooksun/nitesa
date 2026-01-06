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
            district: true,
          },
        },
      },
    })

    const districtCounts: Record<string, number> = {}

    supervisions.forEach((supervision) => {
      const district = supervision.school.district
      if (district) {
        districtCounts[district] = (districtCounts[district] || 0) + 1
      }
    })

    const districtData = Object.entries(districtCounts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ districts: districtData })
  } catch (error) {
    console.error('Error fetching district data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

