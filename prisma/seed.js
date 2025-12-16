const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create a test organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'green-street-friends' },
    update: {},
    create: {
      name: 'Green Street Friends School',
      slug: 'green-street-friends',
      settings: {
        currency: 'USD',
        fiscalYearStart: 'July',
        defaultThankYouTemplate: 'Thank you for your generous support!',
      }
    }
  });
  
  // Create an admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@greenstreet.org' },
    update: {},
    create: {
      email: 'admin@greenstreet.org',
      name: 'Admin User',
      role: 'ADMIN',
      organizationId: organization.id,
    }
  });
  
  // Create a staff user
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@greenstreet.org' },
    update: {},
    create: {
      email: 'staff@greenstreet.org',
      name: 'Staff User',
      role: 'STAFF',
      organizationId: organization.id,
    }
  });
  
  // Create sample campaigns
  const annualCampaign = await prisma.campaign.create({
    data: {
      name: 'Annual Fund 2024',
      description: 'Annual fundraising campaign for general operations',
      goal: 1000000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: 'ACTIVE',
      organizationId: organization.id,
    }
  });
  
  const scholarshipCampaign = await prisma.campaign.create({
    data: {
      name: 'Scholarship Fund',
      description: 'Support for student scholarships',
      goal: 500000,
      startDate: new Date('2024-01-01'),
      status: 'ACTIVE',
      organizationId: organization.id,
    }
  });
  
  // Create sample donors
  const donor1 = await prisma.donor.create({
    data: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '+1-555-0123',
      preferredContact: 'EMAIL',
      relationshipStage: 'MAJOR_GIFT',
      interests: ['education', 'technology', 'sports'],
      personalNotes: {
        'hobbies': 'Golf, Reading, Travel',
        'family': 'Married with 2 children in elementary school',
        'notes': 'Prefers email communication on weekdays',
      },
      totalGiven: 25000,
      firstGiftDate: new Date('2020-05-15'),
      lastGiftDate: new Date('2024-01-15'),
      giftsCount: 8,
      hasActivePledge: true,
      pledgeTotal: 50000,
      pledgePaid: 25000,
      pledgeStartDate: new Date('2023-01-01'),
      pledgeEndDate: new Date('2025-12-31'),
      pledgeFrequency: 'ANNUALLY',
      tags: ['major_donor', 'board_member', 'alumni'],
      status: 'ACTIVE',
      organizationId: organization.id,
    }
  });
  
  const donor2 = await prisma.donor.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      phone: '+1-555-0124',
      preferredContact: 'PHONE',
      relationshipStage: 'STEWARDSHIP',
      interests: ['arts', 'music', 'community'],
      personalNotes: {
        'hobbies': 'Painting, Piano, Gardening',
        'volunteer': 'Weekly volunteer in arts program',
        'kids_hobbies': 'Art classes, Soccer',
      },
      totalGiven: 5000,
      firstGiftDate: new Date('2021-03-10'),
      lastGiftDate: new Date('2023-12-20'),
      giftsCount: 5,
      tags: ['recurring', 'volunteer', 'parent'],
      status: 'ACTIVE',
      organizationId: organization.id,
    }
  });
  
  const donor3 = await prisma.donor.create({
    data: {
      firstName: 'Robert',
      lastName: 'Chen',
      email: 'r.chen@example.com',
      preferredContact: 'EMAIL',
      relationshipStage: 'CULTIVATION',
      interests: ['science', 'innovation', 'entrepreneurship'],
      personalNotes: {
        'company': 'TechCorp Inc.',
        'matching': 'Company matches donations 2:1',
      },
      totalGiven: 1000,
      firstGiftDate: new Date('2022-11-05'),
      lastGiftDate: new Date('2023-11-05'), // Last year - LYBUNT candidate
      giftsCount: 2,
      tags: ['prospect', 'corporate', 'matching'],
      status: 'ACTIVE',
      organizationId: organization.id,
    }
  });
  
  // Create sample donations
  const donation1 = await prisma.donation.create({
    data: {
      amount: 10000,
      date: new Date('2024-01-15'),
      paymentMethod: 'BANK_TRANSFER',
      type: 'PLEDGE_PAYMENT',
      status: 'COMPLETED',
      donorId: donor1.id,
      campaignId: annualCampaign.id,
      organizationId: organization.id,
      notes: 'Annual pledge payment',
    }
  });
  
  const donation2 = await prisma.donation.create({
    data: {
      amount: 5000,
      date: new Date('2023-12-20'),
      paymentMethod: 'CREDIT_CARD',
      type: 'ONE_TIME',
      status: 'COMPLETED',
      donorId: donor2.id,
      campaignId: scholarshipCampaign.id,
      organizationId: organization.id,
      notes: 'Holiday giving',
    }
  });
  
  const donation3 = await prisma.donation.create({
    data: {
      amount: 500,
      date: new Date('2023-11-05'),
      paymentMethod: 'CREDIT_CARD',
      type: 'ONE_TIME',
      status: 'COMPLETED',
      donorId: donor3.id,
      campaignId: annualCampaign.id,
      organizationId: organization.id,
      notes: 'Annual fund',
    }
  });
  
  // Create sample communications
  await prisma.communication.create({
    data: {
      type: 'EMAIL',
      direction: 'OUTBOUND',
      subject: 'Thank you for your generous donation',
      content: 'Dear John, Thank you for your recent donation of $10,000...',
      status: 'SENT',
      sentAt: new Date('2024-01-16'),
      donorId: donor1.id,
      organizationId: organization.id,
      relatedDonationId: donation1.id,
    }
  });
  
  await prisma.communication.create({
    data: {
      type: 'MEETING',
      direction: 'OUTBOUND',
      subject: 'Annual check-in meeting',
      summary: 'Discussed scholarship program and upcoming capital campaign',
      status: 'SENT',
      sentAt: new Date('2024-01-10'),
      donorId: donor1.id,
      organizationId: organization.id,
      requiresFollowUp: true,
      followUpDate: new Date('2024-02-10'),
    }
  });
  
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });