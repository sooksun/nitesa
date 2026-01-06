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
    const networkGroup = await prisma.networkGroup.findUnique({
      where: { id },
      include: {
        schools: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    })

    if (!networkGroup) {
      return NextResponse.json({ error: 'Network group not found' }, { status: 404 })
    }

    return NextResponse.json(networkGroup)
  } catch (error) {
    console.error('Error fetching network group:', error)
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
    const { code, name, description } = body

    // Check if code already exists (excluding current record)
    if (code) {
      const existing = await prisma.networkGroup.findFirst({
        where: {
          code,
          NOT: { id },
        },
      })

      if (existing) {
        return NextResponse.json({ error: 'Network group code already exists' }, { status: 400 })
      }
    }

    const networkGroup = await prisma.networkGroup.update({
      where: { id },
      data: {
        code: code || undefined,
        name: name || undefined,
        description: description !== undefined ? description : undefined,
      },
    })

    return NextResponse.json(networkGroup)
  } catch (error) {
    console.error('Error updating network group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    // Check if network group is used by any schools
    const schoolsCount = await prisma.school.count({
      where: { networkGroupId: id },
    })

    if (schoolsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete network group that is assigned to schools' },
        { status: 400 }
      )
    }

    await prisma.networkGroup.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting network group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

