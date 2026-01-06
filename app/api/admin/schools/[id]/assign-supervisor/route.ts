import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { supervisorIds } = body

    const school = await prisma.school.update({
      where: { id },
      data: {
        supervisors: {
          set: supervisorIds.map((supervisorId: string) => ({ id: supervisorId })),
        },
      },
      include: {
        supervisors: true,
      },
    })

    return NextResponse.json(school)
  } catch (error) {
    console.error('Error assigning supervisors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

