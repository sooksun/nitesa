import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { PolicyType } from '@prisma/client'

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
    const policy = await prisma.policy.findUnique({
      where: { id },
    })

    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 })
    }

    return NextResponse.json(policy)
  } catch (error) {
    console.error('Error fetching policy:', error)
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
    const { title, description, isActive } = body

    // Policy code and type cannot be changed (auto-generated)
    // Only allow updating title, description, and isActive

    const policy = await prisma.policy.update({
      where: { id },
      data: {
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    })

    return NextResponse.json(policy)
  } catch (error) {
    console.error('Error updating policy:', error)
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

    // Check if policy is used by any supervisions
    const supervisionsCount =
      (await prisma.supervision.count({
        where: { ministerPolicyId: id },
      })) +
      (await prisma.supervision.count({
        where: { obecPolicyId: id },
      })) +
      (await prisma.supervision.count({
        where: { areaPolicyId: id },
      }))

    if (supervisionsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete policy that is used by supervisions' },
        { status: 400 }
      )
    }

    await prisma.policy.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting policy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

