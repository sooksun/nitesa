import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { prisma } from '@/lib/db'
import { Role, SupervisionStatus, IndicatorLevel } from '@prisma/client'
import { createTestUser, createTestSchool, cleanupTestData } from '@/lib/test-utils'

describe('Supervisions API', () => {
  let testUser: any
  let testSchool: any

  beforeAll(async () => {
    await cleanupTestData()
    testUser = await createTestUser(Role.SUPERVISOR)
    testSchool = await createTestSchool()
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  it('should create a supervision', async () => {
    const supervision = await prisma.supervision.create({
      data: {
        schoolId: testSchool.id,
        userId: testUser.id,
        type: 'นิเทศการสอน',
        date: new Date(),
        summary: 'Test summary',
        suggestions: 'Test suggestions',
        status: SupervisionStatus.DRAFT,
        indicators: {
          create: [
            {
              name: 'Test Indicator',
              level: IndicatorLevel.GOOD,
            },
          ],
        },
      },
    })

    expect(supervision).toBeDefined()
    expect(supervision.type).toBe('นิเทศการสอน')
  })

  it('should fetch supervisions for a supervisor', async () => {
    const supervisions = await prisma.supervision.findMany({
      where: {
        userId: testUser.id,
      },
    })

    expect(supervisions.length).toBeGreaterThan(0)
  })
})

