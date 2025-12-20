import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function calculateLYBUNT() {
  try {
    const currentYear = new Date().getFullYear()
    const lastYearStart = new Date(currentYear - 1, 0, 1)
    const lastYearEnd = new Date(currentYear - 1, 11, 31)
    const thisYearStart = new Date(currentYear, 0, 1)
    
    // Get donors who gave last year
    const lastYearDonors = await prisma.donor.findMany({
      where: {
        lastGiftDate: {
          gte: lastYearStart,
          lte: lastYearEnd,
        },
      },
      include: {
        donations: {
          where: {
            date: {
              gte: thisYearStart,
            },
          },
        },
      },
    })
    
    // Filter to those who haven't given this year
    const lybuntDonors = lastYearDonors.filter(donor => 
      donor.donations.length === 0
    )
    
    return lybuntDonors
  } catch (error) {
    console.error('Error calculating LYBUNT:', error)
    throw error
  }
}

export function isLYBUNT(donor, currentYear) {
  if (!donor.lastGiftDate) return false
  
  const lastGiftYear = new Date(donor.lastGiftDate).getFullYear()
  return lastGiftYear === currentYear - 1
}