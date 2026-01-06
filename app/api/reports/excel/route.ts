import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { generateSupervisionExcel, generateSchoolPerformanceExcel } from '@/lib/export-excel'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'supervisions'
    const schoolId = searchParams.get('schoolId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let where: any = {}

    if (session.user.role === 'SCHOOL') {
      const school = await prisma.school.findFirst({
        where: { email: session.user.email },
      })
      if (school) {
        where.schoolId = school.id
      } else {
        return NextResponse.json({ error: 'School not found' }, { status: 404 })
      }
    } else if (schoolId) {
      where.schoolId = schoolId
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    if (type === 'supervisions') {
      const supervisions = await prisma.supervision.findMany({
        where,
        include: {
          school: true,
          user: true,
          indicators: true,
        },
        orderBy: {
          date: 'desc',
        },
      })

      const excelData = supervisions.map((s) => ({
        schoolCode: s.school.code,
        schoolName: s.school.name,
        date: s.date.toISOString().split('T')[0],
        type: s.type,
        status: s.status,
        summary: s.summary,
        indicators: s.indicators.map((i) => `${i.name} (${i.level})`).join(', '),
        score: s.indicators.reduce((acc, i) => {
          const scores: Record<string, number> = {
            EXCELLENT: 4,
            GOOD: 3,
            FAIR: 2,
            NEEDS_WORK: 1,
          }
          return acc + (scores[i.level] || 0)
        }, 0) / s.indicators.length,
      }))

      const buffer = generateSupervisionExcel(excelData)

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="supervisions-${Date.now()}.xlsx"`,
        },
      })
    } else if (type === 'schools') {
      if (session.user.role !== 'ADMIN' && session.user.role !== 'EXECUTIVE') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const schools = await prisma.school.findMany({
        include: {
          _count: {
            select: {
              supervisions: true,
            },
          },
          supervisions: {
            include: {
              indicators: true,
            },
          },
        },
      })

      const excelData = schools.map((school) => {
        const avgScore =
          school.supervisions.length > 0
            ? school.supervisions.reduce((acc, s) => {
                const score =
                  s.indicators.reduce((sum, i) => {
                    const scores: Record<string, number> = {
                      EXCELLENT: 4,
                      GOOD: 3,
                      FAIR: 2,
                      NEEDS_WORK: 1,
                    }
                    return sum + (scores[i.level] || 0)
                  }, 0) / s.indicators.length
                return acc + score
              }, 0) / school.supervisions.length
            : 0

        return {
          code: school.code,
          name: school.name,
          district: school.district,
          studentCount: school.studentCount || 0,
          teacherCount: school.teacherCount || 0,
          totalSupervisions: school._count.supervisions,
          averageScore: avgScore.toFixed(2),
        }
      })

      const buffer = generateSchoolPerformanceExcel(excelData)

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="schools-performance-${Date.now()}.xlsx"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Error generating Excel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

