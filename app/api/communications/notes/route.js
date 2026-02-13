import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/auth';

// ============================================
// NOTES API - Centralized Notes Management
// ============================================
// 
// Data Sources (Models with notes fields):
// 1. Donor - donor.notes (general donor notes)
// 2. Donation - donation.notes (donation-specific notes)
// 3. Communication - communication.content (message content)
// 4. Meeting - meeting.notes (meeting notes)
// 5. Task - task.description (task notes/description)
//
// All notes are returned with consistent formatting including:
// - Note content
// - Source model and ID
// - Timestamps
// - Related entities (donor, user, etc.)
// - Suggested AI responses (future implementation)
// ============================================

// Helper: Fetch notes from all models
async function fetchAllNotes(organizationId, filters = {}) {
  const { donorId, userId, limit = 100, offset = 0, search = '' } = filters;
  
  const notes = [];
  const searchCondition = search ? {
    contains: search,
    mode: 'insensitive'
  } : undefined;

  // ============ 1. DONOR NOTES ============
  const donorNotes = await prisma.donor.findMany({
    where: {
      organizationId,
      ...(donorId && { id: donorId }),
      ...(search && {
        OR: [
          { notes: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ]
      })
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    skip: offset
  });

  donorNotes.forEach(donor => {
    if (donor.notes) {
      notes.push({
        id: `donor_${donor.id}`,
        noteId: donor.id,
        content: donor.notes,
        source: 'DONOR',
        sourceModel: 'Donor',
        sourceId: donor.id,
        title: `Donor Note: ${donor.firstName} ${donor.lastName}`,
        donorId: donor.id,
        donorName: `${donor.firstName} ${donor.lastName}`,
        donorEmail: donor.email,
        createdBy: donor.assignedTo,
        createdAt: donor.createdAt,
        updatedAt: donor.updatedAt,
        isEditable: true,
        canDelete: true,
        metadata: {
          type: 'donor_profile_note',
          isSimulated: false // Will be updated if needed
        }
      });
    }
  });

  // ============ 2. DONATION NOTES ============
  const donationNotes = await prisma.donation.findMany({
    where: {
      organizationId,
      ...(donorId && { donorId }),
      notes: search ? { contains: search, mode: 'insensitive' } : { not: null }
    },
    select: {
      id: true,
      notes: true,
      amount: true,
      date: true,
      status: true,
      type: true,
      createdAt: true,
      updatedAt: true,
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
    orderBy: { updatedAt: 'desc' },
    take: limit,
    skip: offset
  });

  donationNotes.forEach(donation => {
    if (donation.notes) {
      notes.push({
        id: `donation_${donation.id}`,
        noteId: donation.id,
        content: donation.notes,
        source: 'DONATION',
        sourceModel: 'Donation',
        sourceId: donation.id,
        title: `Donation Note: $${donation.amount}`,
        donorId: donation.donor.id,
        donorName: `${donation.donor.firstName} ${donation.donor.lastName}`,
        donorEmail: donation.donor.email,
        amount: donation.amount,
        donationDate: donation.date,
        campaign: donation.campaign,
        createdAt: donation.createdAt,
        updatedAt: donation.updatedAt,
        isEditable: true,
        canDelete: true,
        metadata: {
          type: 'donation_note',
          donationStatus: donation.status,
          donationType: donation.type
        }
      });
    }
  });

  // ============ 3. COMMUNICATION NOTES (Content) ============
  const communicationNotes = await prisma.communication.findMany({
    where: {
      organizationId,
      ...(donorId && { donorId }),
      ...(userId && { userId }),
      content: search ? { contains: search, mode: 'insensitive' } : { not: null }
    },
    select: {
      id: true,
      content: true,
      subject: true,
      summary: true,
      type: true,
      direction: true,
      status: true,
      sentAt: true,
      createdAt: true,
      updatedAt: true,
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
      },
      campaign: {
        select: {
          id: true,
          name: true
        }
      },
      relatedDonation: {
        select: {
          id: true,
          amount: true,
          date: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    skip: offset
  });

  communicationNotes.forEach(comm => {
    if (comm.content) {
      notes.push({
        id: `comm_${comm.id}`,
        noteId: comm.id,
        content: comm.content,
        source: 'COMMUNICATION',
        sourceModel: 'Communication',
        sourceId: comm.id,
        title: comm.subject || `${comm.type} Communication`,
        donorId: comm.donor.id,
        donorName: `${comm.donor.firstName} ${comm.donor.lastName}`,
        donorEmail: comm.donor.email,
        createdBy: comm.user,
        communicationType: comm.type,
        direction: comm.direction,
        sentAt: comm.sentAt,
        campaign: comm.campaign,
        relatedDonation: comm.relatedDonation,
        createdAt: comm.createdAt,
        updatedAt: comm.updatedAt,
        isEditable: true,
        canDelete: true,
        metadata: {
          type: 'communication_note',
          status: comm.status,
          hasSummary: !!comm.summary
        }
      });
    }
  });

  // ============ 4. MEETING NOTES ============
  const meetingNotes = await prisma.meeting.findMany({
    where: {
      organizationId,
      ...(donorId && { donorId }),
      ...(userId && { userId }),
      notes: search ? { contains: search, mode: 'insensitive' } : { not: null }
    },
    select: {
      id: true,
      notes: true,
      title: true,
      description: true,
      startTime: true,
      endTime: true,
      status: true,
      createdAt: true,
      updatedAt: true,
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
    orderBy: { updatedAt: 'desc' },
    take: limit,
    skip: offset
  });

  meetingNotes.forEach(meeting => {
    if (meeting.notes) {
      notes.push({
        id: `meeting_${meeting.id}`,
        noteId: meeting.id,
        content: meeting.notes,
        source: 'MEETING',
        sourceModel: 'Meeting',
        sourceId: meeting.id,
        title: meeting.title || 'Meeting Notes',
        donorId: meeting.donor.id,
        donorName: `${meeting.donor.firstName} ${meeting.donor.lastName}`,
        donorEmail: meeting.donor.email,
        createdBy: meeting.user,
        meetingTime: {
          start: meeting.startTime,
          end: meeting.endTime
        },
        meetingStatus: meeting.status,
        createdAt: meeting.createdAt,
        updatedAt: meeting.updatedAt,
        isEditable: true,
        canDelete: true,
        metadata: {
          type: 'meeting_note',
          hasDescription: !!meeting.description
        }
      });
    }
  });

  // ============ 5. TASK NOTES (Description) ============
  const taskNotes = await prisma.task.findMany({
    where: {
      organizationId,
      ...(donorId && { donorId }),
      ...(userId && {
        OR: [
          { assignedToId: userId },
          { assignedById: userId }
        ]
      }),
      description: search ? { contains: search, mode: 'insensitive' } : { not: null }
    },
    select: {
      id: true,
      description: true,
      title: true,
      priority: true,
      status: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
      donor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      assignedBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    skip: offset
  });

  taskNotes.forEach(task => {
    if (task.description) {
      notes.push({
        id: `task_${task.id}`,
        noteId: task.id,
        content: task.description,
        source: 'TASK',
        sourceModel: 'Task',
        sourceId: task.id,
        title: task.title || 'Task Note',
        donorId: task.donor?.id || null,
        donorName: task.donor ? `${task.donor.firstName} ${task.donor.lastName}` : null,
        donorEmail: task.donor?.email || null,
        createdBy: task.assignedBy,
        assignedTo: task.assignedTo,
        taskPriority: task.priority,
        taskStatus: task.status,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        isEditable: true,
        canDelete: true,
        metadata: {
          type: 'task_note',
          hasDonor: !!task.donor
        }
      });
    }
  });

  // Sort all notes by updatedAt (most recent first)
  return notes.sort((a, b) => 
    new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
  );
}

// ============================================
// GET: Fetch notes with optional filters
// ============================================
export async function GET(request) {
  try {
    // Authentication
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    const organizationId = user.organizationId;
    const url = new URL(request.url);
    
    // Parse query parameters
    const donorId = url.searchParams.get('donorId');
    const userId = url.searchParams.get('userId');
    const source = url.searchParams.get('source'); // DONOR, DONATION, COMMUNICATION, MEETING, TASK
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search');
    const includeSimulated = url.searchParams.get('includeSimulated') === 'true';

    // Fetch all notes
    let notes = await fetchAllNotes(organizationId, {
      donorId,
      userId,
      limit,
      offset,
      search
    });

    // Filter by source if specified
    if (source) {
      notes = notes.filter(note => note.source === source);
    }

    // Filter out simulated data unless explicitly requested
    if (!includeSimulated) {
      notes = notes.filter(note => !note.metadata?.isSimulated);
    }

    // Get total counts per source
    const counts = {
      total: notes.length,
      bySource: {
        DONOR: notes.filter(n => n.source === 'DONOR').length,
        DONATION: notes.filter(n => n.source === 'DONATION').length,
        COMMUNICATION: notes.filter(n => n.source === 'COMMUNICATION').length,
        MEETING: notes.filter(n => n.source === 'MEETING').length,
        TASK: notes.filter(n => n.source === 'TASK').length
      }
    };

    // Generate suggested responses (placeholder for AI integration)
    const suggestedResponses = [];

    return NextResponse.json({
      success: true,
      data: {
        notes,
        counts,
        suggestedResponses,
        filters: {
          donorId,
          userId,
          source,
          search,
          includeSimulated
        },
        pagination: {
          limit,
          offset,
          total: notes.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch notes'
    }, { status: 500 });
  }
}

// ============================================
// POST: Create a new note
// ============================================
export async function POST(request) {
  try {
    // Authentication
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    const organizationId = user.organizationId;
    const body = await request.json();
    
    const { 
      source,        // DONOR, DONATION, COMMUNICATION, MEETING, TASK
      sourceId,      // ID of the record to attach note to
      content,       // The note content
      donorId,       // Required for most sources
      title,         // Optional title
      metadata = {}  // Additional metadata
    } = body;

    // Validation
    if (!source || !sourceId || !content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: source, sourceId, content'
      }, { status: 400 });
    }

    if (!['DONOR', 'DONATION', 'COMMUNICATION', 'MEETING', 'TASK'].includes(source)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid source. Must be DONOR, DONATION, COMMUNICATION, MEETING, or TASK'
      }, { status: 400 });
    }

    let result;
    let activityData;

    // ============ CREATE NOTE BASED ON SOURCE ============
    switch (source) {
      case 'DONOR':
        // Verify donor belongs to organization
        const donor = await prisma.donor.findFirst({
          where: { id: sourceId, organizationId }
        });

        if (!donor) {
          return NextResponse.json({
            success: false,
            error: 'Donor not found'
          }, { status: 404 });
        }

        // Update donor notes
        result = await prisma.donor.update({
          where: { id: sourceId },
          data: { 
            notes: content,
            updatedAt: new Date()
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            notes: true,
            updatedAt: true
          }
        });

        activityData = {
          action: 'NOTE_ADDED',
          title: 'Donor Note Added',
          description: `Added note to donor ${donor.firstName} ${donor.lastName}`
        };
        break;

      case 'DONATION':
        // Verify donation belongs to organization
        const donation = await prisma.donation.findFirst({
          where: { id: sourceId, organizationId },
          include: { donor: true }
        });

        if (!donation) {
          return NextResponse.json({
            success: false,
            error: 'Donation not found'
          }, { status: 404 });
        }

        // Update donation notes
        result = await prisma.donation.update({
          where: { id: sourceId },
          data: { 
            notes: content,
            updatedAt: new Date()
          },
          include: {
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        });

        activityData = {
          action: 'NOTE_ADDED',
          title: 'Donation Note Added',
          description: `Added note to donation #${donation.id}`
        };
        break;

      case 'COMMUNICATION':
        // Verify communication belongs to organization
        const communication = await prisma.communication.findFirst({
          where: { id: sourceId, organizationId },
          include: { donor: true }
        });

        if (!communication) {
          return NextResponse.json({
            success: false,
            error: 'Communication not found'
          }, { status: 404 });
        }

        // Update communication content
        result = await prisma.communication.update({
          where: { id: sourceId },
          data: { 
            content,
            updatedAt: new Date()
          },
          include: {
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        });

        activityData = {
          action: 'NOTE_ADDED',
          title: 'Communication Note Added',
          description: `Added note to communication with ${communication.donor.firstName} ${communication.donor.lastName}`
        };
        break;

      case 'MEETING':
        // Verify meeting belongs to organization
        const meeting = await prisma.meeting.findFirst({
          where: { id: sourceId, organizationId },
          include: { donor: true }
        });

        if (!meeting) {
          return NextResponse.json({
            success: false,
            error: 'Meeting not found'
          }, { status: 404 });
        }

        // Update meeting notes
        result = await prisma.meeting.update({
          where: { id: sourceId },
          data: { 
            notes: content,
            updatedAt: new Date()
          },
          include: {
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        });

        activityData = {
          action: 'NOTE_ADDED',
          title: 'Meeting Note Added',
          description: `Added note to meeting with ${meeting.donor.firstName} ${meeting.donor.lastName}`
        };
        break;

      case 'TASK':
        // Verify task belongs to organization
        const task = await prisma.task.findFirst({
          where: { id: sourceId, organizationId },
          include: { donor: true }
        });

        if (!task) {
          return NextResponse.json({
            success: false,
            error: 'Task not found'
          }, { status: 404 });
        }

        // Update task description
        result = await prisma.task.update({
          where: { id: sourceId },
          data: { 
            description: content,
            updatedAt: new Date()
          },
          include: {
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        });

        activityData = {
          action: 'NOTE_ADDED',
          title: 'Task Note Added',
          description: `Added note to task: ${task.title}`
        };
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid source'
        }, { status: 400 });
    }

    // Create activity feed entry
    if (activityData) {
      await prisma.activityFeed.create({
        data: {
          organizationId,
          userId: user.id,
          donorId: donorId || result.donor?.id,
          action: activityData.action,
          title: activityData.title,
          description: activityData.description,
          metadata: {
            source,
            sourceId,
            noteContent: content.substring(0, 100),
            ...metadata
          },
          priority: 'NORMAL',
          isRead: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        note: {
          id: `${source.toLowerCase()}_${result.id}`,
          source,
          sourceId: result.id,
          content,
          createdAt: result.createdAt || new Date(),
          updatedAt: result.updatedAt || new Date(),
          donor: result.donor,
          ...result
        }
      },
      message: 'Note created successfully'
    });

  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create note'
    }, { status: 500 });
  }
}

// ============================================
// PUT: Update an existing note
// ============================================
export async function PUT(request) {
  try {
    // Authentication
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    const organizationId = user.organizationId;
    const body = await request.json();
    
    const { 
      source,        // DONOR, DONATION, COMMUNICATION, MEETING, TASK
      sourceId,      // ID of the record
      content,       // Updated note content
      metadata = {} 
    } = body;

    // Validation
    if (!source || !sourceId || !content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: source, sourceId, content'
      }, { status: 400 });
    }

    let result;

    // ============ UPDATE NOTE BASED ON SOURCE ============
    switch (source) {
      case 'DONOR':
        result = await prisma.donor.update({
          where: { 
            id: sourceId,
            organizationId 
          },
          data: { 
            notes: content,
            updatedAt: new Date()
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            notes: true,
            updatedAt: true
          }
        });
        break;

      case 'DONATION':
        result = await prisma.donation.update({
          where: { 
            id: sourceId,
            organizationId 
          },
          data: { 
            notes: content,
            updatedAt: new Date()
          }
        });
        break;

      case 'COMMUNICATION':
        result = await prisma.communication.update({
          where: { 
            id: sourceId,
            organizationId 
          },
          data: { 
            content,
            updatedAt: new Date()
          }
        });
        break;

      case 'MEETING':
        result = await prisma.meeting.update({
          where: { 
            id: sourceId,
            organizationId 
          },
          data: { 
            notes: content,
            updatedAt: new Date()
          }
        });
        break;

      case 'TASK':
        result = await prisma.task.update({
          where: { 
            id: sourceId,
            organizationId 
          },
          data: { 
            description: content,
            updatedAt: new Date()
          }
        });
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid source'
        }, { status: 400 });
    }

    // Create activity feed for update
    await prisma.activityFeed.create({
      data: {
        organizationId,
        userId: user.id,
        action: 'NOTE_UPDATED',
        title: 'Note Updated',
        description: `Updated ${source.toLowerCase()} note`,
        metadata: {
          source,
          sourceId,
          ...metadata
        },
        priority: 'NORMAL',
        isRead: false
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: `${source.toLowerCase()}_${result.id}`,
        source,
        sourceId: result.id,
        content,
        updatedAt: result.updatedAt
      },
      message: 'Note updated successfully'
    });

  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update note'
    }, { status: 500 });
  }
}

// ============================================
// DELETE: Delete a note
// ============================================
export async function DELETE(request) {
  try {
    // Authentication
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    const organizationId = user.organizationId;
    const url = new URL(request.url);
    
    const source = url.searchParams.get('source');
    const sourceId = url.searchParams.get('sourceId');

    if (!source || !sourceId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required params: source, sourceId'
      }, { status: 400 });
    }

    // ============ DELETE NOTE BASED ON SOURCE ============
    switch (source) {
      case 'DONOR':
        await prisma.donor.update({
          where: { 
            id: sourceId,
            organizationId 
          },
          data: { 
            notes: null,
            updatedAt: new Date()
          }
        });
        break;

      case 'DONATION':
        await prisma.donation.update({
          where: { 
            id: sourceId,
            organizationId 
          },
          data: { 
            notes: null,
            updatedAt: new Date()
          }
        });
        break;

      case 'COMMUNICATION':
        await prisma.communication.update({
          where: { 
            id: sourceId,
            organizationId 
          },
          data: { 
            content: null,
            updatedAt: new Date()
          }
        });
        break;

      case 'MEETING':
        await prisma.meeting.update({
          where: { 
            id: sourceId,
            organizationId 
          },
          data: { 
            notes: null,
            updatedAt: new Date()
          }
        });
        break;

      case 'TASK':
        await prisma.task.update({
          where: { 
            id: sourceId,
            organizationId 
          },
          data: { 
            description: null,
            updatedAt: new Date()
          }
        });
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid source'
        }, { status: 400 });
    }

    // Create activity feed for deletion
    await prisma.activityFeed.create({
      data: {
        organizationId,
        userId: user.id,
        action: 'NOTE_DELETED',
        title: 'Note Deleted',
        description: `Deleted ${source.toLowerCase()} note`,
        metadata: {
          source,
          sourceId
        },
        priority: 'NORMAL',
        isRead: false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete note'
    }, { status: 500 });
  }
}