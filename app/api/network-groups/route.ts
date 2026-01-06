import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const networkGroups = await prisma.networkGroup.findMany({
      orderBy: {
        code: 'asc',
      },
    })

    return NextResponse.json(networkGroups)
  } catch (error) {
    console.error('Error fetching network groups:', error)
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
    const { code, name, description } = body

    // Check if code already exists
    const existing = await prisma.networkGroup.findUnique({
      where: { code },
    })

    if (existing) {
      return NextResponse.json({ error: 'Network group code already exists' }, { status: 400 })
    }

    const networkGroup = await prisma.networkGroup.create({
      data: {
        code,
        name,
        description: description || null,
      },
    })

    return NextResponse.json(networkGroup)
  } catch (error) {
    console.error('Error creating network group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

