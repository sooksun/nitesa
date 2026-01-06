import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only SCHOOL role can acknowledge
    if (session.user.role !== 'SCHOOL') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { comment } = body

    // Get supervision
    const supervision = await prisma.supervision.findUnique({
      where: { id },
      include: {
        school: true,
      },
    })

    if (!supervision) {
      return NextResponse.json({ error: 'Supervision not found' }, { status: 404 })
    }

    // Check if school matches user
    const school = await prisma.school.findFirst({
      where: { email: session.user.email },
    })

    if (!school || school.id !== supervision.schoolId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if already acknowledged
    const existing = await prisma.acknowledgement.findUnique({
      where: { supervisionId: id },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already acknowledged' }, { status: 400 })
    }

    // Create acknowledgement
    const acknowledgement = await prisma.acknowledgement.create({
      data: {
        supervisionId: id,
        acknowledgedBy: school.principalName || session.user.name,
        acknowledgedAt: new Date(),
        comment: comment || null,
      },
    })

    return NextResponse.json(acknowledgement)
  } catch (error) {
    console.error('Error acknowledging supervision:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

