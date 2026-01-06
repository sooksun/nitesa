import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the latest school code
    const latestSchool = await prisma.school.findFirst({
      orderBy: {
        code: 'desc',
      },
      select: {
        code: true,
      },
    })

    let nextNumber = 1

    if (latestSchool) {
      // Extract number from code (e.g., "SCH001" -> 1)
      const match = latestSchool.code.match(/SCH(\d+)/i)
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1
      }
    }

    // Generate new code with 3-digit padding (e.g., SCH001, SCH002, ...)
    const newCode = `SCH${nextNumber.toString().padStart(3, '0')}`

    return NextResponse.json({ code: newCode })
  } catch (error) {
    console.error('Error generating school code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

