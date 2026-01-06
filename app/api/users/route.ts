import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { createActivityLog } from '@/lib/activity-log'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, name, password, role, assignedSchoolIds } = body

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: (role as Role) || Role.SCHOOL,
        assignedSchools: assignedSchoolIds
          ? {
              connect: assignedSchoolIds.map((schoolId: string) => ({ id: schoolId })),
            }
          : undefined,
      },
      include: {
        assignedSchools: true,
      },
    })

    // Don't return password
    const { password: _, ...userWithoutPassword } = user

    // Create activity log
    const headersList = await headers()
    await createActivityLog(
      session.user.id,
      'CREATE_USER',
      'users',
      user.id,
      { email: user.email, role: user.role },
      headersList.get('x-forwarded-for') || undefined,
      headersList.get('user-agent') || undefined
    )

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

