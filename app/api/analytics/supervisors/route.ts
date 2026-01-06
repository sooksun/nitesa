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
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const supervisorStats: Record<
      string,
      {
        name: string
        total: number
        approved: number
      }
    > = {}

    supervisions.forEach((supervision) => {
      const userId = supervision.userId
      if (!supervisorStats[userId]) {
        supervisorStats[userId] = {
          name: supervision.user.name,
          total: 0,
          approved: 0,
        }
      }
      supervisorStats[userId].total++
      if (supervision.status === 'APPROVED') {
        supervisorStats[userId].approved++
      }
    })

    const supervisorData = Object.values(supervisorStats)
      .map((stat) => ({
        name: stat.name,
        total: stat.total,
        approved: stat.approved,
        rate: stat.total > 0 ? Math.round((stat.approved / stat.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)

    return NextResponse.json({ supervisors: supervisorData })
  } catch (error) {
    console.error('Error fetching supervisor performance data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

