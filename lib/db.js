import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { connected: true }
  } catch (error) {
    console.error('Database connection failed:', error)
    return { connected: false, error: error.message }
  }
}

export async function getDatabaseStats() {
  try {
    const [donorCount, donationCount, communicationCount] = await Promise.all([
      prisma.donor.count(),
      prisma.donation.count(),
      prisma.communication.count(),
    ])

    return {
      donors: donorCount,
      donations: donationCount,
      communications: communicationCount,
    }
  } catch (error) {
    console.error('Failed to get database stats:', error)
    throw error
  }
}

export async function cleanupOldData(days = 90) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    // This is just an example - adjust based on your data retention policy
    const result = await prisma.communication.deleteMany({
      where: {
        sentAt: {
          lt: cutoffDate,
        },
        status: {
          not: 'FAILED', // Don't delete failed communications
        },
      },
    })

    return { deleted: result.count }
  } catch (error) {
    console.error('Failed to cleanup old data:', error)
    throw error
  }
}