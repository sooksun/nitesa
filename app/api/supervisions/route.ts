import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { SupervisionStatus, IndicatorLevel } from '@prisma/client'
import { createActivityLog } from '@/lib/activity-log'
import { headers } from 'next/headers'

function getFileTypeFromUrl(url: string): string {
  const ext = url.split('.').pop()?.toLowerCase() || ''
  const typeMap: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
  }
  return typeMap[ext] || 'application/octet-stream'
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only SUPERVISOR and ADMIN can create supervisions
    if (session.user.role !== 'SUPERVISOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      schoolId,
      userId,
      type,
      date,
      academicYear,
      ministerPolicyId,
      obecPolicyId,
      areaPolicyId,
      summary,
      suggestions,
      status,
      indicators,
      attachments = [], // Array of FileAttachment objects
    } = body

    // Validate school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    })

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    // If SUPERVISOR, check if school is assigned
    if (session.user.role === 'SUPERVISOR') {
      const isAssigned = await prisma.school.findFirst({
        where: {
          id: schoolId,
          supervisors: {
            some: { id: session.user.id },
          },
        },
      })

      if (!isAssigned) {
        return NextResponse.json(
          { error: 'You are not assigned to this school' },
          { status: 403 }
        )
      }
    }

    // Validate policy IDs if provided (just check if they exist)
    if (ministerPolicyId) {
      const policy = await prisma.policy.findUnique({
        where: { id: ministerPolicyId },
      })
      if (!policy) {
        return NextResponse.json({ error: 'Invalid minister policy' }, { status: 400 })
      }
    }
    if (obecPolicyId) {
      const policy = await prisma.policy.findUnique({
        where: { id: obecPolicyId },
      })
      if (!policy) {
        return NextResponse.json({ error: 'Invalid OBEC policy' }, { status: 400 })
      }
    }
    if (areaPolicyId) {
      const policy = await prisma.policy.findUnique({
        where: { id: areaPolicyId },
      })
      if (!policy) {
        return NextResponse.json({ error: 'Invalid area policy' }, { status: 400 })
      }
    }

    // Create supervision
    const supervision = await prisma.supervision.create({
      data: {
        schoolId,
        userId: userId || session.user.id,
        type,
        date: new Date(date),
        academicYear: academicYear || null,
        ministerPolicyId: ministerPolicyId || null,
        obecPolicyId: obecPolicyId || null,
        areaPolicyId: areaPolicyId || null,
        summary,
        suggestions,
        status: status || SupervisionStatus.DRAFT,
        indicators: {
          create: indicators.map((ind: any) => ({
            name: ind.name,
            level: ind.level as IndicatorLevel,
            comment: ind.comment || null,
          })),
        },
        attachments: attachments.length > 0
          ? {
              create: attachments.map((att: any) => ({
                filename: att.filename || 'attachment',
                fileUrl: att.fileUrl,
                fileType: att.fileType || getFileTypeFromUrl(att.fileUrl),
                fileSize: att.fileSize || 0,
              })),
            }
          : undefined,
      },
      include: {
        school: true,
        user: true,
        indicators: true,
      },
    })

    // Create activity log
    const headersList = await headers()
    await createActivityLog(
      session.user.id,
      'CREATE_SUPERVISION',
      'supervisions',
      supervision.id,
      { schoolId, type, status: supervision.status },
      headersList.get('x-forwarded-for') || undefined,
      headersList.get('user-agent') || undefined
    )

    return NextResponse.json(supervision)
  } catch (error) {
    console.error('Error creating supervision:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')

    let where: any = {}

    // Role-based filtering
    if (session.user.role === 'SUPERVISOR') {
      where = {
        userId: session.user.id,
      }
    } else if (session.user.role === 'SCHOOL') {
      // Get school from user email
      const school = await prisma.school.findFirst({
        where: { email: session.user.email },
      })
      if (school) {
        where = { schoolId: school.id }
      } else {
        return NextResponse.json([])
      }
    }

    if (schoolId) {
      where.schoolId = schoolId
    }

    const supervisions = await prisma.supervision.findMany({
      where,
      include: {
        school: true,
        user: true,
        indicators: true,
        acknowledgement: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(supervisions)
  } catch (error) {
    console.error('Error fetching supervisions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

