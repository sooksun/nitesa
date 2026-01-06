import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { generateSupervisionPDF } from '@/lib/export-pdf'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const supervisionId = searchParams.get('supervisionId')

    if (!supervisionId) {
      return NextResponse.json({ error: 'supervisionId required' }, { status: 400 })
    }

    const supervision = await prisma.supervision.findUnique({
      where: { id: supervisionId },
      include: {
        school: true,
        user: true,
        indicators: true,
      },
    })

    if (!supervision) {
      return NextResponse.json({ error: 'Supervision not found' }, { status: 404 })
    }

    // Check permission
    if (session.user.role === 'SCHOOL') {
      const school = await prisma.school.findFirst({
        where: { email: session.user.email },
      })
      if (!school || school.id !== supervision.schoolId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else if (session.user.role === 'SUPERVISOR' && supervision.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pdfBlob = await generateSupervisionPDF(supervision)

    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="supervision-${supervisionId}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

