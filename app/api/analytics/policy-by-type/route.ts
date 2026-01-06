import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supervisions = await prisma.supervision.findMany({
      select: {
        type: true,
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

    const typeStats: Record<string, Record<string, number>> = {}

    supervisions.forEach((supervision) => {
      if (!typeStats[supervision.type]) {
        typeStats[supervision.type] = {}
      }
      
      // Count policies by their actual type
      if (supervision.ministerPolicyId) {
        const policyType = policyTypeMap.get(supervision.ministerPolicyId)
        if (policyType) {
          typeStats[supervision.type][policyType] = (typeStats[supervision.type][policyType] || 0) + 1
        }
      }
      if (supervision.obecPolicyId) {
        const policyType = policyTypeMap.get(supervision.obecPolicyId)
        if (policyType) {
          typeStats[supervision.type][policyType] = (typeStats[supervision.type][policyType] || 0) + 1
        }
      }
      if (supervision.areaPolicyId) {
        const policyType = policyTypeMap.get(supervision.areaPolicyId)
        if (policyType) {
          typeStats[supervision.type][policyType] = (typeStats[supervision.type][policyType] || 0) + 1
        }
      }
    })

    const policyByTypeData = Object.entries(typeStats).map(([type, stats]) => ({
      type,
      ...stats,
    }))

    return NextResponse.json({ data: policyByTypeData })
  } catch (error) {
    console.error('Error fetching policy by type data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

