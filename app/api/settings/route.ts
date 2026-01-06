import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { supervisionTypes, indicatorCriteria } = body

    // Update supervision types
    await prisma.systemSetting.upsert({
      where: { key: 'supervision_types' },
      update: { value: supervisionTypes },
      create: {
        key: 'supervision_types',
        value: supervisionTypes,
        description: 'ประเภทการนิเทศ',
      },
    })

    // Update indicator criteria
    await prisma.systemSetting.upsert({
      where: { key: 'indicator_criteria' },
      update: { value: indicatorCriteria },
      create: {
        key: 'indicator_criteria',
        value: indicatorCriteria,
        description: 'เกณฑ์การประเมินตัวชี้วัด',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

