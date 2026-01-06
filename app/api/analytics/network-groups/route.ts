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
          include: {
            networkGroup: true,
          },
        },
      },
    })

    const groupCounts: Record<string, number> = {}
    const groupNames: Record<string, string> = {}

    supervisions.forEach((supervision) => {
      const networkGroup = supervision.school.networkGroup
      if (networkGroup) {
        const groupId = networkGroup.id
        if (!groupCounts[groupId]) {
          groupCounts[groupId] = 0
          groupNames[groupId] = networkGroup.name
        }
        groupCounts[groupId]++
      }
    })

    const groupData = Object.entries(groupCounts)
      .map(([id, count]) => ({
        id,
        name: groupNames[id] || 'ไม่ระบุ',
        count,
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ groups: groupData })
  } catch (error) {
    console.error('Error fetching network group data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

