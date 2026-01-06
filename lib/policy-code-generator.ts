import { PolicyType } from '@prisma/client'
import { prisma } from '@/lib/db'

/**
 * Generate policy code automatically based on type
 * Format: POL-{TYPE}-{NUMBER}
 * Example: POL-NAT-001, POL-CIV-001, POL-EDU-001
 */
export async function generatePolicyCode(type: PolicyType): Promise<string> {
  // Generate prefix from enum name (take first 3 chars of each word)
  const prefix = type
    .split('_')
    .map((word) => word.substring(0, 3).toUpperCase())
    .join('')
    .substring(0, 6) // Limit to 6 characters for cleaner codes

  // Find the highest number for this policy type
  const existingPolicies = await prisma.policy.findMany({
    where: {
      type,
      code: {
        startsWith: `POL-${prefix}-`,
      },
    },
    orderBy: {
      code: 'desc',
    },
    take: 1,
  })

  let nextNumber = 1

  if (existingPolicies.length > 0) {
    const lastCode = existingPolicies[0].code
    // Extract number from code like "POL-MIN-001"
    const match = lastCode.match(/POL-\w+-(\d+)/)
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1
    }
  }

  // Format number with leading zeros (3 digits)
  const formattedNumber = nextNumber.toString().padStart(3, '0')

  return `POL-${prefix}-${formattedNumber}`
}

