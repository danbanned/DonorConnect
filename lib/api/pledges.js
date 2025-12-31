import { prisma } from './../db.js'

export async function getActivePledges() {
  try {
    const pledges = await prisma.donor.findMany({
      where: {
        hasActivePledge: true,
        pledgeEndDate: {
          gte: new Date(),
        },
      },
      include: {
        donations: {
          where: {
            type: 'PLEDGE_PAYMENT',
            date: {
              gte: new Date(new Date().getFullYear(), 0, 1),
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    })

    return pledges.map(donor => ({
      ...donor,
      paymentsThisYear: donor.donations.reduce((sum, d) => sum + d.amount, 0),
      paymentsCount: donor.donations.length,
    }))
  } catch (error) {
    console.error('Error fetching active pledges:', error)
    throw error
  }
}

export async function createPledge(donorId, pledgeData) {
  try {
    const { total, frequency, startDate, endDate } = pledgeData
    
    const donor = await prisma.donor.update({
      where: { id: donorId },
      data: {
        hasActivePledge: true,
        pledgeTotal: total,
        pledgePaid: 0,
        pledgeStartDate: new Date(startDate),
        pledgeEndDate: new Date(endDate),
        pledgeFrequency: frequency,
      },
    })

    return donor
  } catch (error) {
    console.error('Error creating pledge:', error)
    throw error
  }
}

export async function recordPledgePayment(donorId, amount, date) {
  try {
    // Record the donation
    const donation = await prisma.donation.create({
      data: {
        donorId,
        amount,
        date: date ? new Date(date) : new Date(),
        paymentMethod: 'BANK_TRANSFER', // Default, should be parameterized
        type: 'PLEDGE_PAYMENT',
        status: 'COMPLETED',
        organizationId: 'test-org',
      },
    })

    // Update pledge paid amount
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      select: { pledgePaid: true, pledgeTotal: true },
    })

    const newPaidAmount = (donor.pledgePaid || 0) + amount
    
    await prisma.donor.update({
      where: { id: donorId },
      data: {
        pledgePaid: newPaidAmount,
      },
    })

    // Check if pledge is complete
    if (newPaidAmount >= donor.pledgeTotal) {
      await prisma.donor.update({
        where: { id: donorId },
        data: {
          hasActivePledge: false,
        },
      })
    }

    return { donation, paid: newPaidAmount, remaining: donor.pledgeTotal - newPaidAmount }
  } catch (error) {
    console.error('Error recording pledge payment:', error)
    throw error
  }
}

export async function getPledgeSchedule(donorId) {
  try {
    const donor = await prisma.donor.findUnique({
      where: { id: donorId },
      select: {
        pledgeTotal: true,
        pledgePaid: true,
        pledgeStartDate: true,
        pledgeEndDate: true,
        pledgeFrequency: true,
      },
    })

    if (!donor.hasActivePledge) {
      return []
    }

    const schedule = generateSchedule(
      donor.pledgeTotal,
      donor.pledgePaid,
      donor.pledgeStartDate,
      donor.pledgeEndDate,
      donor.pledgeFrequency
    )

    // Get actual payments
    const payments = await prisma.donation.findMany({
      where: {
        donorId,
        type: 'PLEDGE_PAYMENT',
      },
      orderBy: { date: 'asc' },
    })

    // Map payments to schedule
    return schedule.map((item, index) => ({
      ...item,
      actualPayment: payments[index] || null,
      status: payments[index] ? 'PAID' : 'PENDING',
    }))
  } catch (error) {
    console.error('Error getting pledge schedule:', error)
    throw error
  }
}

function generateSchedule(total, paid, startDate, endDate, frequency) {
  const schedule = []
  const remaining = total - (paid || 0)
  
  if (remaining <= 0) return schedule

  let paymentAmount
  let paymentCount

  switch (frequency) {
    case 'MONTHLY':
      paymentCount = monthsBetween(startDate, endDate)
      paymentAmount = remaining / paymentCount
      break
    case 'QUARTERLY':
      paymentCount = Math.ceil(monthsBetween(startDate, endDate) / 3)
      paymentAmount = remaining / paymentCount
      break
    case 'ANNUALLY':
      paymentCount = yearsBetween(startDate, endDate)
      paymentAmount = remaining / paymentCount
      break
    default:
      paymentCount = 1
      paymentAmount = remaining
  }

  let currentDate = new Date(startDate)
  
  for (let i = 0; i < paymentCount; i++) {
    schedule.push({
      dueDate: new Date(currentDate),
      amount: paymentAmount,
      installment: i + 1,
      totalInstallments: paymentCount,
    })

    // Increment date based on frequency
    switch (frequency) {
      case 'MONTHLY':
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
      case 'QUARTERLY':
        currentDate.setMonth(currentDate.getMonth() + 3)
        break
      case 'ANNUALLY':
        currentDate.setFullYear(currentDate.getFullYear() + 1)
        break
    }
  }

  return schedule
}

function monthsBetween(start, end) {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
}

function yearsBetween(start, end) {
  return end.getFullYear() - start.getFullYear()
}