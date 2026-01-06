import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalSchools,
      totalSupervisions,
      totalUsers,
      approvedSupervisions,
      pendingSupervisions,
      schoolsByDistrict,
    ] = await Promise.all([
      prisma.school.count(),
      prisma.supervision.count(),
      prisma.user.count(),
      prisma.supervision.count({ where: { status: 'APPROVED' } }),
      prisma.supervision.count({ where: { status: 'SUBMITTED' } }),
      prisma.school.groupBy({
        by: ['district'],
        _count: { id: true },
      }),
    ])

    const approvalRate =
      totalSupervisions > 0 ? (approvedSupervisions / totalSupervisions) * 100 : 0

    return NextResponse.json({
      totalSchools,
      totalSupervisions,
      totalUsers,
      approvedSupervisions,
      pendingSupervisions,
      approvalRate: Math.round(approvalRate),
      schoolsByDistrict,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

