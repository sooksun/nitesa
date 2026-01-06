import { prisma } from './db'

export async function createActivityLog(
  userId: string,
  action: string,
  entity?: string,
  entityId?: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details ? JSON.parse(JSON.stringify(details)) : null,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error('Error creating activity log:', error)
    // Don't throw error, just log it
  }
}

