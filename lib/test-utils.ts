import { prisma } from './db'
import { Role } from '@prisma/client'

export async function createTestUser(role: Role = Role.SCHOOL) {
  return await prisma.user.create({
    data: {
      email: `test-${Date.now()}@test.com`,
      name: 'Test User',
      role,
    },
  })
}

export async function createTestSchool() {
  return await prisma.school.create({
    data: {
      code: `TEST${Date.now()}`,
      name: 'Test School',
      district: 'Test District',
    },
  })
}

export async function cleanupTestData() {
  await prisma.acknowledgement.deleteMany({})
  await prisma.attachment.deleteMany({})
  await prisma.indicator.deleteMany({})
  await prisma.supervision.deleteMany({})
  await prisma.improvement.deleteMany({})
  await prisma.activityLog.deleteMany({})
  await prisma.school.deleteMany({})
  await prisma.user.deleteMany({})
}

