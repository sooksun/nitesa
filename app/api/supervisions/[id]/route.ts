import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { SupervisionStatus, IndicatorLevel } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supervision = await prisma.supervision.findUnique({
      where: { id },
      include: {
        school: true,
        user: true,
        indicators: true,
        attachments: true,
        acknowledgement: true,
      },
    })

    if (!supervision) {
      return NextResponse.json({ error: 'Supervision not found' }, { status: 404 })
    }

    return NextResponse.json(supervision)
  } catch (error) {
    console.error('Error fetching supervision:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { type, date, academicYear, ministerPolicyId, obecPolicyId, areaPolicyId, summary, suggestions, status, indicators, attachments } = body

    // Check if supervision exists
    const existing = await prisma.supervision.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Supervision not found' }, { status: 404 })
    }

    // Check permission
    if (
      session.user.role !== 'ADMIN' &&
      (session.user.role !== 'SUPERVISOR' || existing.userId !== session.user.id)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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

    // Get existing attachments
    const existingAttachments = await prisma.attachment.findMany({
      where: { supervisionId: id },
    })

    // Determine which attachments to keep, delete, and add
    const attachmentIdsToKeep = (attachments || [])
      .filter((att: any) => att.id && att.id.startsWith('attachment-'))
      .map((att: any) => att.id.replace('attachment-', ''))

    const attachmentsToDelete = existingAttachments.filter(
      (att) => !attachmentIdsToKeep.includes(att.id)
    )

    const attachmentsToAdd = (attachments || []).filter(
      (att: any) => !att.id || !att.id.startsWith('attachment-')
    )

    // Helper function to get file type from URL
    const getFileTypeFromUrl = (url: string): string => {
      const extension = url.split('.').pop()?.toLowerCase() || ''
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
      return typeMap[extension] || 'application/octet-stream'
    }

    // Update supervision
    const supervision = await prisma.supervision.update({
      where: { id },
      data: {
        type,
        date: new Date(date),
        academicYear: academicYear || null,
        ministerPolicyId: ministerPolicyId || null,
        obecPolicyId: obecPolicyId || null,
        areaPolicyId: areaPolicyId || null,
        summary,
        suggestions,
        status: status || existing.status,
        indicators: {
          deleteMany: {},
          create: indicators.map((ind: any) => ({
            name: ind.name,
            level: ind.level as IndicatorLevel,
            comment: ind.comment || null,
          })),
        },
        attachments: {
          deleteMany: {
            id: {
              in: attachmentsToDelete.map((att) => att.id),
            },
          },
          create: attachmentsToAdd.map((att: any) => ({
            filename: att.filename || 'attachment',
            fileUrl: att.fileUrl,
            fileType: att.fileType || getFileTypeFromUrl(att.fileUrl),
            fileSize: att.fileSize || 0,
          })),
        },
      },
      include: {
        school: true,
        user: true,
        indicators: true,
        attachments: true,
      },
    })

    return NextResponse.json(supervision)
  } catch (error) {
    console.error('Error updating supervision:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if supervision exists
    const existing = await prisma.supervision.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Supervision not found' }, { status: 404 })
    }

    // Only ADMIN or owner can delete
    if (
      session.user.role !== 'ADMIN' &&
      (session.user.role !== 'SUPERVISOR' || existing.userId !== session.user.id)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.supervision.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting supervision:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

