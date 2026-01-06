import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'pdf'
    const year = searchParams.get('year')

    // Get data
    const where: any = {}
    if (year) {
      where.date = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${parseInt(year) + 1}-01-01`),
      }
    }

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

    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: {
            supervisions: true,
          },
        },
      },
    })

    if (format === 'excel') {
      // Generate Excel (CSV format for simplicity)
      const csv = generateCSV(supervisions, schools)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="report-${year || 'all'}.csv"`,
        },
      })
    }

    // For PDF, return JSON data (client will handle PDF generation)
    return NextResponse.json({
      supervisions,
      schools,
      summary: {
        totalSupervisions: supervisions.length,
        totalSchools: schools.length,
        approvedCount: supervisions.filter((s) => s.status === 'APPROVED').length,
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateCSV(supervisions: any[], schools: any[]): string {
  const headers = [
    'รหัสโรงเรียน',
    'ชื่อโรงเรียน',
    'วันที่นิเทศ',
    'ประเภท',
    'ผู้นิเทศ',
    'สถานะ',
    'จำนวนตัวชี้วัด',
  ]

  const rows = supervisions.map((s) => [
    s.school.code,
    s.school.name,
    new Date(s.date).toLocaleDateString('th-TH'),
    s.type,
    s.user.name,
    s.status,
    s.indicators.length.toString(),
  ])

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
}

