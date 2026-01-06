import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { PolicyType } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as PolicyType | null
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where = type
      ? {
          type,
          ...(includeInactive ? {} : { isActive: true }),
        }
      : {
          ...(includeInactive ? {} : { isActive: true }),
        }

    const policies = await prisma.policy.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { code: 'asc' },
      ],
    })

    return NextResponse.json(policies)
  } catch (error) {
    console.error('Error fetching policies:', error)
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
    const { type, code, title, description, isActive } = body

    // Check if code already exists for this type
    const existing = await prisma.policy.findUnique({
      where: {
        type_code: {
          type: type as PolicyType,
          code,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Policy code already exists for this type' },
        { status: 400 }
      )
    }

    const policy = await prisma.policy.create({
      data: {
        type: type as PolicyType,
        code,
        title,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(policy)
  } catch (error) {
    console.error('Error creating policy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

