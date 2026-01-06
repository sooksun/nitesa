import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

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
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        supervisors: true,
        networkGroup: true,
        _count: {
          select: {
            supervisions: true,
          },
        },
      },
    })

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    return NextResponse.json(school)
  } catch (error) {
    console.error('Error fetching school:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
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
      supervisorIds,
    } = body

    // Validate networkGroupId if provided
    if (networkGroupId) {
      const networkGroup = await prisma.networkGroup.findUnique({
        where: { id: networkGroupId },
      })
      if (!networkGroup) {
        return NextResponse.json({ error: 'Network group not found' }, { status: 400 })
      }
    }

    const school = await prisma.school.update({
      where: { id },
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
        supervisors: supervisorIds
          ? {
              set: supervisorIds.map((supervisorId: string) => ({ id: supervisorId })),
            }
          : undefined,
      },
      include: {
        supervisors: true,
      },
    })

    return NextResponse.json(school)
  } catch (error: any) {
    console.error('Error updating school:', error)
    // Return more detailed error message
    const errorMessage = error.message || 'Internal server error'
    return NextResponse.json(
      { error: errorMessage, details: error.code || error.meta || null },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.school.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting school:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

