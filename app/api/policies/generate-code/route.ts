import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PolicyType } from '@prisma/client'
import { generatePolicyCode } from '@/lib/policy-code-generator'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as PolicyType | null

    if (!type || !Object.values(PolicyType).includes(type)) {
      return NextResponse.json({ error: 'Invalid policy type' }, { status: 400 })
    }

    const code = await generatePolicyCode(type)

    return NextResponse.json({ code })
  } catch (error) {
    console.error('Error generating policy code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

