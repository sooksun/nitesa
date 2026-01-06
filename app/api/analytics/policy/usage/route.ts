import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PolicyType } from '@prisma/client'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supervisions = await prisma.supervision.findMany({
      select: {
        ministerPolicyId: true,
        obecPolicyId: true,
        areaPolicyId: true,
      },
    })

    // Get all policies to map IDs to types
    const policies = await prisma.policy.findMany({
      select: { id: true, type: true },
    })
    const policyTypeMap = new Map(policies.map((p) => [p.id, p.type]))

    const policyCounts: Record<string, number> = {}

    supervisions.forEach((supervision) => {
      // Count policies by their actual type
      if (supervision.ministerPolicyId) {
        const policyType = policyTypeMap.get(supervision.ministerPolicyId)
        if (policyType) {
          policyCounts[policyType] = (policyCounts[policyType] || 0) + 1
        }
      }
      if (supervision.obecPolicyId) {
        const policyType = policyTypeMap.get(supervision.obecPolicyId)
        if (policyType) {
          policyCounts[policyType] = (policyCounts[policyType] || 0) + 1
        }
      }
      if (supervision.areaPolicyId) {
        const policyType = policyTypeMap.get(supervision.areaPolicyId)
        if (policyType) {
          policyCounts[policyType] = (policyCounts[policyType] || 0) + 1
        }
      }
    })

    const policyData = Object.entries(policyCounts).map(([type, count]) => ({
      type,
      count,
    }))

    return NextResponse.json({ policies: policyData })
  } catch (error) {
    console.error('Error fetching policy usage data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

