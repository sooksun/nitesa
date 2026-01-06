import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SupervisionStatus } from '@prisma/client'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supervisions = await prisma.supervision.findMany({
      select: {
        status: true,
      },
    })

    const statusCounts: Record<string, number> = {}
    Object.values(SupervisionStatus).forEach((status) => {
      statusCounts[status] = 0
    })

    supervisions.forEach((supervision) => {
      statusCounts[supervision.status]++
    })

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }))

    return NextResponse.json({ statuses: statusData })
  } catch (error) {
    console.error('Error fetching supervision status data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

