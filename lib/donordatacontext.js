// donordatacontext.js
import prisma from './db'

class DonorDataContext {
  constructor() {
    this.prisma = prisma; // Use the imported prisma instance directly
    this.models = {};
    this.initializeModels();
  }

  initializeModels() {
    // Initialize all models with their relations
    this.models = {
      // Users & Organizations
      User: {
        findMany: (options = {}) => this.prisma.user.findMany(options),
        findUnique: (options) => this.prisma.user.findUnique(options),
        create: (data) => this.prisma.user.create(data),
        update: (options) => this.prisma.user.update(options),
        delete: (options) => this.prisma.user.delete(options),
        count: (options = {}) => this.prisma.user.count(options),
        withRelations: this.withUserRelations.bind(this)
      },
      
      Organization: {
        findMany: (options = {}) => this.prisma.organization.findMany(options),
        findUnique: (options) => this.prisma.organization.findUnique(options),
        create: (data) => this.prisma.organization.create(data),
        update: (options) => this.prisma.organization.update(options),
        delete: (options) => this.prisma.organization.delete(options),
        count: (options = {}) => this.prisma.organization.count(options),
        withRelations: this.withOrganizationRelations.bind(this)
      },
      
      Session: {
        findMany: (options = {}) => this.prisma.session.findMany(options),
        findUnique: (options) => this.prisma.session.findUnique(options),
        create: (data) => this.prisma.session.create(data),
        update: (options) => this.prisma.session.update(options),
        delete: (options) => this.prisma.session.delete(options),
        count: (options = {}) => this.prisma.session.count(options)
      },
      
      AuditLog: {
        findMany: (options = {}) => this.prisma.auditLog.findMany(options),
        findUnique: (options) => this.prisma.auditLog.findUnique(options),
        create: (data) => this.prisma.auditLog.create(data),
        count: (options = {}) => this.prisma.auditLog.count(options),
        getRecentActivity: this.getRecentActivity.bind(this)
      },
      
      PasswordResetToken: {
        findUnique: (options) => this.prisma.passwordResetToken.findUnique(options),
        create: (data) => this.prisma.passwordResetToken.create(data),
        delete: (options) => this.prisma.passwordResetToken.delete(options)
      },
      
      // Donors
      Donor: {
        findMany: (options = {}) => this.prisma.donor.findMany(options),
        findUnique: (options) => this.prisma.donor.findUnique(options),
        create: (data) => this.prisma.donor.create(data),
        update: (options) => this.prisma.donor.update(options),
        delete: (options) => this.prisma.donor.delete(options),
        count: (options = {}) => this.prisma.donor.count(options),
        withRelations: this.withDonorRelations.bind(this),
        getDonorSummary: this.getDonorSummary.bind(this),
        searchDonors: this.searchDonors.bind(this),
        getDonorsByInterest: this.getDonorsByInterest.bind(this),
        getDonorsByTag: this.getDonorsByTag.bind(this)
      },
      
      Address: {
        findUnique: (options) => this.prisma.address.findUnique(options),
        create: (data) => this.prisma.address.create(data),
        update: (options) => this.prisma.address.update(options),
        delete: (options) => this.prisma.address.delete(options)
      },
      
      // Interests & Tags
      Interest: {
        findMany: (options = {}) => this.prisma.interest.findMany(options),
        findUnique: (options) => this.prisma.interest.findUnique(options),
        create: (data) => this.prisma.interest.create(data),
        update: (options) => this.prisma.interest.update(options),
        delete: (options) => this.prisma.interest.delete(options),
        count: (options = {}) => this.prisma.interest.count(options),
        getDonorsByInterest: this.getDonorsByInterest.bind(this)
      },
      
      Tag: {
        findMany: (options = {}) => this.prisma.tag.findMany(options),
        findUnique: (options) => this.prisma.tag.findUnique(options),
        create: (data) => this.prisma.tag.create(data),
        update: (options) => this.prisma.tag.update(options),
        delete: (options) => this.prisma.tag.delete(options),
        count: (options = {}) => this.prisma.tag.count(options),
        getDonorsByTag: this.getDonorsByTag.bind(this)
      },
      
      DonorInterest: {
        findMany: (options = {}) => this.prisma.donorInterest.findMany(options),
        findUnique: (options) => this.prisma.donorInterest.findUnique(options),
        create: (data) => this.prisma.donorInterest.create(data),
        update: (options) => this.prisma.donorInterest.update(options),
        delete: (options) => this.prisma.donorInterest.delete(options),
        count: (options = {}) => this.prisma.donorInterest.count(options),
        addInterestToDonor: this.addInterestToDonor.bind(this),
        removeInterestFromDonor: this.removeInterestFromDonor.bind(this)
      },
      
      DonorTag: {
        findMany: (options = {}) => this.prisma.donorTag.findMany(options),
        findUnique: (options) => this.prisma.donorTag.findUnique(options),
        create: (data) => this.prisma.donorTag.create(data),
        update: (options) => this.prisma.donorTag.update(options),
        delete: (options) => this.prisma.donorTag.delete(options),
        count: (options = {}) => this.prisma.donorTag.count(options),
        addTagToDonor: this.addTagToDonor.bind(this),
        removeTagFromDonor: this.removeTagFromDonor.bind(this)
      },
      
      // Pledges
      Pledge: {
        findMany: (options = {}) => this.prisma.pledge.findMany(options),
        findUnique: (options) => this.prisma.pledge.findUnique(options),
        create: (data) => this.prisma.pledge.create(data),
        update: (options) => this.prisma.pledge.update(options),
        delete: (options) => this.prisma.pledge.delete(options),
        count: (options = {}) => this.prisma.pledge.count(options),
        getPledgeSummary: this.getPledgeSummary.bind(this),
        withRelations: this.withPledgeRelations.bind(this)
      },
      
      // Donations
      Donation: {
        findMany: (options = {}) => this.prisma.donation.findMany(options),
        findUnique: (options) => this.prisma.donation.findUnique(options),
        create: (data) => this.prisma.donation.create(data),
        update: (options) => this.prisma.donation.update(options),
        delete: (options) => this.prisma.donation.delete(options),
        count: (options = {}) => this.prisma.donation.count(options),
        getDonationStats: this.getDonationStats.bind(this),
        getRecentDonations: this.getRecentDonations.bind(this),
        withRelations: this.withDonationRelations.bind(this)
      },
      
      SoftCredit: {
        findMany: (options = {}) => this.prisma.softCredit.findMany(options),
        findUnique: (options) => this.prisma.softCredit.findUnique(options),
        create: (data) => this.prisma.softCredit.create(data),
        update: (options) => this.prisma.softCredit.update(options),
        delete: (options) => this.prisma.softCredit.delete(options),
        count: (options = {}) => this.prisma.softCredit.count(options)
      },
      
      // Campaigns
      Campaign: {
        findMany: (options = {}) => this.prisma.campaign.findMany(options),
        findUnique: (options) => this.prisma.campaign.findUnique(options),
        create: (data) => this.prisma.campaign.create(data),
        update: (options) => this.prisma.campaign.update(options),
        delete: (options) => this.prisma.campaign.delete(options),
        count: (options = {}) => this.prisma.campaign.count(options),
        getCampaignStats: this.getCampaignStats.bind(this),
        withRelations: this.withCampaignRelations.bind(this)
      },
      
      // Communications
      Communication: {
        findMany: (options = {}) => this.prisma.communication.findMany(options),
        findUnique: (options) => this.prisma.communication.findUnique(options),
        create: (data) => this.prisma.communication.create(data),
        update: (options) => this.prisma.communication.update(options),
        delete: (options) => this.prisma.communication.delete(options),
        count: (options = {}) => this.prisma.communication.count(options),
        getRecentCommunications: this.getRecentCommunications.bind(this),
        withRelations: this.withCommunicationRelations.bind(this)
      },
      
      // Activity Feed
      ActivityFeed: {
        findMany: (options = {}) => this.prisma.activityFeed.findMany(options),
        findUnique: (options) => this.prisma.activityFeed.findUnique(options),
        create: (data) => this.prisma.activityFeed.create(data),
        update: (options) => this.prisma.activityFeed.update(options),
        delete: (options) => this.prisma.activityFeed.delete(options),
        count: (options = {}) => this.prisma.activityFeed.count(options),
        getOrganizationActivity: this.getOrganizationActivity.bind(this)
      },
      
      DonorActivity: {
        findMany: (options = {}) => this.prisma.donorActivity.findMany(options),
        findUnique: (options) => this.prisma.donorActivity.findUnique(options),
        create: (data) => this.prisma.donorActivity.create(data),
        update: (options) => this.prisma.donorActivity.update(options),
        delete: (options) => this.prisma.donorActivity.delete(options),
        count: (options = {}) => this.prisma.donorActivity.count(options),
        getDonorTimeline: this.getDonorTimeline.bind(this)
      },
      
      // Meetings
      Meeting: {
        findMany: (options = {}) => this.prisma.meeting.findMany(options),
        findUnique: (options) => this.prisma.meeting.findUnique(options),
        create: (data) => this.prisma.meeting.create(data),
        update: (options) => this.prisma.meeting.update(options),
        delete: (options) => this.prisma.meeting.delete(options),
        count: (options = {}) => this.prisma.meeting.count(options),
        getUpcomingMeetings: this.getUpcomingMeetings.bind(this),
        withRelations: this.withMeetingRelations.bind(this)
      },
      
      // Tasks
      Task: {
        findMany: (options = {}) => this.prisma.task.findMany(options),
        findUnique: (options) => this.prisma.task.findUnique(options),
        create: (data) => this.prisma.task.create(data),
        update: (options) => this.prisma.task.update(options),
        delete: (options) => this.prisma.task.delete(options),
        count: (options = {}) => this.prisma.task.count(options),
        getPendingTasks: this.getPendingTasks.bind(this),
        withRelations: this.withTaskRelations.bind(this)
      },
      
      // Files
      DonorFile: {
        findMany: (options = {}) => this.prisma.donorFile.findMany(options),
        findUnique: (options) => this.prisma.donorFile.findUnique(options),
        create: (data) => this.prisma.donorFile.create(data),
        update: (options) => this.prisma.donorFile.update(options),
        delete: (options) => this.prisma.donorFile.delete(options),
        count: (options = {}) => this.prisma.donorFile.count(options),
        getFilesByDonor: this.getFilesByDonor.bind(this),
        getFileUrl: this.getFileUrl.bind(this)
      }
    };
  }

  // Enhanced relation methods
  withUserRelations(options = {}) {
    return this.prisma.user.findMany({
      ...options,
      include: {
        organization: true,
        sessions: true,
        assignedDonors: true,
        communications: true,
        meetings: true,
        tasks: true,
        assignedTasks: true,
        auditLogs: true
      }
    });
  }

  withOrganizationRelations(options = {}) {
    return this.prisma.organization.findMany({
      ...options,
      include: {
        users: true,
        donors: true,
        donations: true,
        campaigns: true,
        communications: true,
        pledges: true,
        meetings: true,
        tasks: true,
        auditLogs: true
      }
    });
  }

  withDonorRelations(options = {}) {
    return this.prisma.donor.findMany({
      ...options,
      include: {
        organization: true,
        assignedTo: true,
        address: true,
        donations: {
          include: {
            campaign: true,
            softCredits: true,
            communications: true
          }
        },
        pledges: true,
        interests: {
          include: {
            interest: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        communications: {
          include: {
            user: true,
            campaign: true
          }
        },
        meetings: {
          include: {
            user: true
          }
        },
        activities: true,
        tasks: true,
        files: true
      }
    });
  }

  withDonationRelations(options = {}) {
    return this.prisma.donation.findMany({
      ...options,
      include: {
        donor: true,
        organization: true,
        campaign: true,
        softCredits: true,
        communications: true
      }
    });
  }

  withCampaignRelations(options = {}) {
    return this.prisma.campaign.findMany({
      ...options,
      include: {
        organization: true,
        donations: {
          include: {
            donor: true
          }
        },
        communications: true
      }
    });
  }

  withCommunicationRelations(options = {}) {
    return this.prisma.communication.findMany({
      ...options,
      include: {
        donor: true,
        organization: true,
        user: true,
        campaign: true,
        relatedDonation: true,
        meeting: true
      }
    });
  }

  withMeetingRelations(options = {}) {
    return this.prisma.meeting.findMany({
      ...options,
      include: {
        donor: true,
        organization: true,
        user: true,
        communication: true
      }
    });
  }

  withTaskRelations(options = {}) {
    return this.prisma.task.findMany({
      ...options,
      include: {
        donor: true,
        organization: true,
        user: true,
        assignedBy: true
      }
    });
  }

  withPledgeRelations(options = {}) {
    return this.prisma.pledge.findMany({
      ...options,
      include: {
        donor: true,
        organization: true
      }
    });
  }

  // New methods for DonorInterest
  async addInterestToDonor(donorId, interestId) {
    return this.prisma.donorInterest.create({
      data: {
        donorId,
        interestId
      }
    });
  }

  async removeInterestFromDonor(donorId, interestId) {
    return this.prisma.donorInterest.deleteMany({
      where: {
        donorId,
        interestId
      }
    });
  }

  async getDonorsByInterest(interestId, organizationId) {
    return this.prisma.donorInterest.findMany({
      where: {
        interestId,
        donor: {
          organizationId
        }
      },
      include: {
        donor: {
          include: {
            donations: {
              select: {
                amount: true,
                date: true
              },
              take: 5,
              orderBy: { date: 'desc' }
            }
          }
        },
        interest: true
      }
    });
  }

  // New methods for DonorTag
  async addTagToDonor(donorId, tagId) {
    return this.prisma.donorTag.create({
      data: {
        donorId,
        tagId
      }
    });
  }

  async removeTagFromDonor(donorId, tagId) {
    return this.prisma.donorTag.deleteMany({
      where: {
        donorId,
        tagId
      }
    });
  }

  async getDonorsByTag(tagId, organizationId) {
    return this.prisma.donorTag.findMany({
      where: {
        tagId,
        donor: {
          organizationId
        }
      },
      include: {
        donor: {
          include: {
            donations: {
              select: {
                amount: true,
                date: true
              },
              take: 5,
              orderBy: { date: 'desc' }
            }
          }
        },
        tag: true
      }
    });
  }

  // New methods for DonorFile
  async getFilesByDonor(donorId) {
    return this.prisma.donorFile.findMany({
      where: { donorId },
      orderBy: { uploadedAt: 'desc' }
    });
  }

  async getFileUrl(fileId) {
    const file = await this.prisma.donorFile.findUnique({
      where: { id: fileId }
    });
    
    if (!file) return null;
    
    // Return the full URL or file path based on your storage implementation
    // This is a placeholder - adjust based on your actual file storage setup
    return `/api/files/${file.id}/download`;
  }

  // Custom business logic methods
  async getDonorSummary(donorId) {
    const donor = await this.prisma.donor.findUnique({
      where: { id: donorId },
      include: {
        donations: {
          select: {
            amount: true,
            date: true,
            status: true
          }
        },
        pledges: {
          select: {
            totalAmount: true,
            amountPaid: true,
            status: true
          }
        },
        communications: {
          select: {
            type: true,
            sentAt: true,
            status: true
          },
          take: 5,
          orderBy: { sentAt: 'desc' }
        },
        activities: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        files: {
          take: 5,
          orderBy: { uploadedAt: 'desc' }
        }
      }
    });

    if (!donor) return null;

    const totalDonations = donor.donations
      .filter(d => d.status === 'COMPLETED')
      .reduce((sum, d) => sum + d.amount, 0);

    const totalPledged = donor.pledges
      .filter(p => p.status === 'ACTIVE')
      .reduce((sum, p) => sum + (p.totalAmount - p.amountPaid), 0);

    const recentActivity = donor.activities.slice(0, 5);

    return {
      donor,
      summary: {
        totalDonations,
        totalPledged,
        donationCount: donor.donations.length,
        pledgeCount: donor.pledges.length,
        communicationCount: donor.communications.length,
        fileCount: donor.files.length,
        lastDonation: donor.donations.sort((a, b) => new Date(b.date) - new Date(a.date))[0],
        lastCommunication: donor.communications[0],
        lastFile: donor.files[0],
        recentActivity
      }
    };
  }

  async getDonationStats(organizationId, filters = {}) {
    const where = { organizationId, ...filters };
    
    const stats = await this.prisma.donation.groupBy({
      by: ['status', 'paymentMethod', 'type'],
      where,
      _count: true,
      _sum: {
        amount: true,
        netAmount: true,
        fees: true
      }
    });

    const total = await this.prisma.donation.aggregate({
      where,
      _sum: {
        amount: true,
        netAmount: true,
        fees: true
      },
      _count: true
    });

    const monthlyTrend = await this.prisma.donation.groupBy({
      by: ['date'],
      where,
      _sum: { amount: true },
      _count: true,
      orderBy: { date: 'desc' },
      take: 12
    });

    return {
      total,
      stats,
      monthlyTrend,
      averageDonation: total._sum.amount ? total._sum.amount / total._count : 0
    };
  }

  async getRecentDonations(organizationId, limit = 10) {
    return this.prisma.donation.findMany({
      where: { organizationId },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        campaign: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: limit
    });
  }

  async getCampaignStats(campaignId) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        donations: {
          select: {
            amount: true,
            netAmount: true,
            status: true,
            date: true
          }
        }
      }
    });

    if (!campaign) return null;

    const donations = campaign.donations.filter(d => d.status === 'COMPLETED');
    const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalNet = donations.reduce((sum, d) => sum + (d.netAmount || d.amount), 0);
    const donorCount = new Set(donations.map(d => d.donorId)).size;

    return {
      campaign,
      stats: {
        totalRaised,
        totalNet,
        donationCount: donations.length,
        donorCount,
        percentageToGoal: campaign.goal ? (totalRaised / campaign.goal) * 100 : 100,
        averageDonation: donations.length ? totalRaised / donations.length : 0
      }
    };
  }

  async getRecentCommunications(donorId, limit = 10) {
    return this.prisma.communication.findMany({
      where: { donorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        campaign: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { sentAt: 'desc' },
      take: limit
    });
  }

  async getUpcomingMeetings(userId, organizationId) {
    const now = new Date();
    return this.prisma.meeting.findMany({
      where: {
        OR: [
          { userId },
          { organizationId }
        ],
        startTime: { gt: now },
        status: 'SCHEDULED'
      },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  async getPendingTasks(userId, organizationId) {
    return this.prisma.task.findMany({
      where: {
        OR: [
          { userId },
          { organizationId }
        ],
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { gte: new Date() }
      },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });
  }

  async getOrganizationActivity(organizationId, limit = 20) {
    return this.prisma.activityFeed.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        donation: {
          select: {
            id: true,
            amount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async getDonorTimeline(donorId) {
    // Combine activities, donations, communications, and meetings for a complete timeline
    const activities = await this.prisma.donorActivity.findMany({
      where: { donorId },
      orderBy: { createdAt: 'desc' }
    });

    const donations = await this.prisma.donation.findMany({
      where: { donorId },
      select: {
        id: true,
        amount: true,
        date: true,
        status: true,
        type: true
      },
      orderBy: { date: 'desc' }
    });

    const communications = await this.prisma.communication.findMany({
      where: { donorId },
      select: {
        id: true,
        type: true,
        subject: true,
        sentAt: true,
        status: true
      },
      orderBy: { sentAt: 'desc' }
    });

    const meetings = await this.prisma.meeting.findMany({
      where: { donorId },
      select: {
        id: true,
        title: true,
        startTime: true,
        status: true
      },
      orderBy: { startTime: 'desc' }
    });

    const files = await this.prisma.donorFile.findMany({
      where: { donorId },
      select: {
        id: true,
        filename: true,
        fileType: true,
        uploadedAt: true
      },
      orderBy: { uploadedAt: 'desc' }
    });

    // Combine and sort all timeline items
    const timeline = [
      ...activities.map(a => ({ ...a, type: 'ACTIVITY' })),
      ...donations.map(d => ({ ...d, type: 'DONATION' })),
      ...communications.map(c => ({ ...c, type: 'COMMUNICATION' })),
      ...meetings.map(m => ({ ...m, type: 'MEETING' })),
      ...files.map(f => ({ ...f, type: 'FILE' }))
    ].sort((a, b) => {
      const dateA = a.createdAt || a.date || a.sentAt || a.startTime || a.uploadedAt;
      const dateB = b.createdAt || b.date || b.sentAt || b.startTime || b.uploadedAt;
      return new Date(dateB) - new Date(dateA);
    });

    return timeline;
  }

  async getRecentActivity(organizationId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.auditLog.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  async getPledgeSummary(pledgeId) {
    const pledge = await this.prisma.pledge.findUnique({
      where: { id: pledgeId },
      include: {
        donor: true,
        organization: true
      }
    });

    if (!pledge) return null;

    // Calculate next payment date based on frequency
    const getNextPaymentDate = () => {
      const today = new Date();
      const startDate = new Date(pledge.startDate);
      
      switch (pledge.frequency) {
        case 'MONTHLY':
          return new Date(today.getFullYear(), today.getMonth() + 1, startDate.getDate());
        case 'QUARTERLY':
          return new Date(today.getFullYear(), today.getMonth() + 3, startDate.getDate());
        case 'ANNUALLY':
          return new Date(today.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
        default:
          return null;
      }
    };

    const remainingAmount = pledge.totalAmount - pledge.amountPaid;
    const nextPaymentDate = getNextPaymentDate();
    const isOverdue = pledge.endDate && new Date() > new Date(pledge.endDate);

    return {
      pledge,
      summary: {
        remainingAmount,
        amountPaid: pledge.amountPaid,
        percentageComplete: (pledge.amountPaid / pledge.totalAmount) * 100,
        nextPaymentDate,
        isOverdue,
        status: pledge.status
      }
    };
  }

  async searchDonors(organizationId, searchTerm, filters = {}) {
    const where = {
      organizationId,
      OR: [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } }
      ],
      ...filters
    };

    return this.prisma.donor.findMany({
      where,
      include: {
        donations: {
          select: {
            amount: true,
            date: true
          },
          take: 5,
          orderBy: { date: 'desc' }
        },
        assignedTo: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { lastName: 'asc' }
    });
  }

  // Transaction helper
  async transaction(operations) {
    return this.prisma.$transaction(operations);
  }

  // Cleanup and disconnect
  async disconnect() {
    await this.prisma.$disconnect();
  }

  // Health check
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date() };
    }
  }
}

// Create and export a singleton instance
const donorDataContext = new DonorDataContext();

export default donorDataContext;
export const donorDataContextInstance = donorDataContext;

// Also export individual models for convenience
export const {
  User,
  Organization,
  Session,
  AuditLog,
  PasswordResetToken,
  Donor,
  Address,
  Interest,
  Tag,
  DonorInterest,
  DonorTag,
  Pledge,
  Donation,
  SoftCredit,
  Campaign,
  Communication,
  ActivityFeed,
  DonorActivity,
  Meeting,
  Task,
  DonorFile
} = donorDataContext.models;

// Export the main context class and Prisma instance
export { DonorDataContext };
export const prismaInstance = donorDataContext.prisma;