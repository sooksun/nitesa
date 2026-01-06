import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SUPERVISOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [assignedSchools, mySupervisions, pendingAcknowledgements] = await Promise.all([
      prisma.school.count({
        where: {
          supervisors: {
            some: { id: session.user.id },
          },
        },
      }),
      prisma.supervision.count({
        where: { userId: session.user.id },
      }),
      prisma.supervision.count({
        where: {
          userId: session.user.id,
          status: 'APPROVED',
          acknowledgement: null,
        },
      }),
    ])

    return NextResponse.json({
      assignedSchools,
      mySupervisions,
      pendingAcknowledgements,
    })
  } catch (error) {
    console.error('Error fetching supervisor stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

