import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SCHOOL' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const school = await prisma.school.findFirst({
      where: {
        email: session.user.email,
      },
    })

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    const [totalSupervisions, latestSupervision, improvements] = await Promise.all([
      prisma.supervision.count({
        where: { schoolId: school.id },
      }),
      prisma.supervision.findFirst({
        where: { schoolId: school.id },
        orderBy: { date: 'desc' },
        include: {
          indicators: true,
        },
      }),
      prisma.improvement.count({
        where: { schoolId: school.id },
      }),
    ])

    return NextResponse.json({
      totalSupervisions,
      latestSupervision,
      improvements,
      school: {
        name: school.name,
        code: school.code,
        studentCount: school.studentCount,
        teacherCount: school.teacherCount,
      },
    })
  } catch (error) {
    console.error('Error fetching school stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

