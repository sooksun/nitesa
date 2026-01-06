import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { schoolId, userId, title, description, fileUrl } = body

    // Verify school belongs to user (for SCHOOL role)
    if (session.user.role === 'SCHOOL') {
      const school = await prisma.school.findFirst({
        where: {
          id: schoolId,
          email: session.user.email,
        },
      })

      if (!school) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const improvement = await prisma.improvement.create({
      data: {
        schoolId,
        userId: userId || session.user.id,
        title,
        description,
        fileUrl: fileUrl || null,
        status: 'pending',
      },
    })

    return NextResponse.json(improvement)
  } catch (error) {
    console.error('Error creating improvement:', error)
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

    if (session.user.role === 'SCHOOL') {
      const school = await prisma.school.findFirst({
        where: { email: session.user.email },
      })
      if (school) {
        where.schoolId = school.id
      } else {
        return NextResponse.json([])
      }
    } else if (schoolId) {
      where.schoolId = schoolId
    }

    const improvements = await prisma.improvement.findMany({
      where,
      include: {
        school: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(improvements)
  } catch (error) {
    console.error('Error fetching improvements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

