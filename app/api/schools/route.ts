import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SUPERVISOR can only see assigned schools
    if (session.user.role === 'SUPERVISOR') {
      const schools = await prisma.school.findMany({
        where: {
          supervisors: {
            some: { id: session.user.id },
          },
        },
        select: {
          id: true,
          name: true,
          code: true,
        },
      })
      return NextResponse.json(schools)
    }

    // ADMIN and EXECUTIVE can see all schools
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(schools)
  } catch (error) {
    console.error('Error fetching schools:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      code,
      name,
      province,
      district,
      subDistrict,
      address,
      phone,
      email,
      principalName,
      studentCount,
      teacherCount,
      networkGroupId,
    } = body

    // Check if code already exists
    const existing = await prisma.school.findUnique({
      where: { code },
    })

    if (existing) {
      return NextResponse.json({ error: 'School code already exists' }, { status: 400 })
    }

    // Validate networkGroupId if provided
    if (networkGroupId) {
      const networkGroup = await prisma.networkGroup.findUnique({
        where: { id: networkGroupId },
      })
      if (!networkGroup) {
        return NextResponse.json({ error: 'Network group not found' }, { status: 400 })
      }
    }

    const school = await prisma.school.create({
      data: {
        code,
        name,
        province: province || null,
        district,
        subDistrict: subDistrict || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
        principalName: principalName || null,
        studentCount: studentCount || null,
        teacherCount: teacherCount || null,
        networkGroupId: networkGroupId || null,
      },
    })

    return NextResponse.json(school)
  } catch (error) {
    console.error('Error creating school:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
