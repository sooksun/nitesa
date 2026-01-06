import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { SupervisionStatus } from '@prisma/client'
import { createActivityLog } from '@/lib/activity-log'
import { sendSupervisionNotification } from '@/lib/email'
import { headers } from 'next/headers'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN can approve
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    const supervision = await prisma.supervision.update({
      where: { id },
      data: {
        status: (status as SupervisionStatus) || SupervisionStatus.APPROVED,
      },
      include: {
        school: true,
        user: true,
      },
    })

    // Create activity log
    const headersList = await headers()
    await createActivityLog(
      session.user.id,
      'APPROVE_SUPERVISION',
      'supervisions',
      supervision.id,
      { status: supervision.status },
      headersList.get('x-forwarded-for') || undefined,
      headersList.get('user-agent') || undefined
    )

    // Send notification email if approved
    if (supervision.status === SupervisionStatus.APPROVED && supervision.school.email) {
      try {
        await sendSupervisionNotification({
          to: supervision.school.email,
          schoolName: supervision.school.name,
          supervisionId: supervision.id,
          date: supervision.date,
        })
      } catch (error) {
        console.error('Error sending email notification:', error)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(supervision)
  } catch (error) {
    console.error('Error approving supervision:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

