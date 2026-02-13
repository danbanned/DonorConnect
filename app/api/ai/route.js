import { NextResponse } from 'next/server';
import prisma from '../../../lib/db'
import OpenAI from 'openai';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth.js';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const activeSimulations = new Map(); // Store active simulation state


// Helper: Generate fake activity based on type
async function generateFakeActivity(organizationId, donorId, userId, activityType, realism = 0.7) {
  const activityTemplates = {
    DONATION: {
      types: ['DONATION'],
      actions: ['DONATION_RECEIVED'],
      title: 'New Donation',
      getDescription: (amount) => `Received $${amount} donation`,
      importance: 'HIGH'
    },
    COMMUNICATION: {
      types: ['COMMUNICATION'],
      actions: ['EMAIL_SENT', 'PHONE_CALL_MADE', 'MEETING_HELD'],
      title: 'Communication',
      getDescription: (type) => `${type} with donor`,
      importance: 'NORMAL'
    },
    MEETING: {
      types: ['MEETING'],
      actions: ['MEETING_SCHEDULED'],
      title: 'Meeting Scheduled',
      getDescription: () => 'Scheduled follow-up meeting',
      importance: 'HIGH'
    },
    TASK: {
      types: ['TASK'],
      actions: ['TASK_CREATED'],
      title: 'New Task',
      getDescription: () => 'Follow-up task created',
      importance: 'NORMAL'
    }
  };

  const template = activityTemplates[activityType] || activityTemplates.DONATION;
  const amount = Math.floor(Math.random() * 500) + 50;
  
  return {
    donorId,
    organizationId,
    type: template.types[0],
    action: template.actions[Math.floor(Math.random() * template.actions.length)],
    title: template.title,
    description: template.getDescription(amount),
    amount: activityType === 'DONATION' ? amount : null,
    importance: template.importance,
    metadata: {
      isSimulated: true,
      realism,
      generatedAt: new Date().toISOString()
    }
  };
}


// Add near the top with other helper functions
function cleanupStaleSimulations() {
  const staleThreshold = 30 * 60 * 1000; // 30 minutes
  const now = Date.now();
  
  for (const [id, sim] of activeSimulations.entries()) {
    if (sim.status === 'running') {
      const lastTick = sim.lastTickAt ? new Date(sim.lastTickAt).getTime() : sim.startedAt ? new Date(sim.startedAt).getTime() : 0;
      
      if (now - lastTick > staleThreshold) {
        console.log(`Cleaning up stale simulation: ${id}`);
        if (sim.nextTickTimeout) {
          clearTimeout(sim.nextTickTimeout);
        }
        sim.status = 'stale';
        activeSimulations.delete(id);
      }
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupStaleSimulations, 5 * 60 * 1000);

// Helper: Generate simulation tick
async function runSimulationTick(simulationId, config) {
  const { organizationId, userId, donorLimit, speed, activityTypes, realism } = config;
  const simulation = activeSimulations.get(simulationId);
  
  if (!simulation || simulation.status !== 'running') {
    return;
  }

  try {
    // Get or create donors
    let donors = simulation.donors;
    if (donors.length === 0) {
      // Create initial batch of donors
      donors = [];
      for (let i = 0; i < Math.min(donorLimit, 20); i++) {
        const donorData = generateFakeDonor(organizationId, true);
        const donor = await prisma.donor.create({
          data: {
            firstName: donorData.firstName,
            lastName: donorData.lastName,
            email: donorData.email,
            phone: donorData.phone,
            organizationId,
            status: donorData.status,
            preferredContact: donorData.preferredContact,
            relationshipStage: donorData.relationshipStage,
            isSimulated: true,
            notes: donorData.notes,
            personalNotes: donorData.personalNotes || {}
          }
        });
        donors.push(donor);
      }
      simulation.donors = donors;
    }

    // Generate activities for random donors
    const activitiesToGenerate = Math.max(1, Math.floor(donors.length * 0.3)); // 30% of donors
    const selectedDonors = donors
      .sort(() => 0.5 - Math.random())
      .slice(0, activitiesToGenerate);

    for (const donor of selectedDonors) {
      // Select random activity type based on enabled types
      const enabledTypes = activityTypes.filter(t => t.enabled);
      if (enabledTypes.length === 0) continue;
      
      const activityType = enabledTypes[Math.floor(Math.random() * enabledTypes.length)].type;
      
      // Generate activity based on realism factor
      if (Math.random() <= realism) {
        const activityData = await generateFakeActivity(
          organizationId,
          donor.id,
          userId,
          activityType,
          realism
        );

        // Create the activity
        await prisma.donorActivity.create({
          data: activityData
        });

        // If donation, also create donation record
        if (activityType === 'DONATION') {
          const amount = Math.floor(Math.random() * 500) + 50;
          await prisma.donation.create({
            data: {
              donorId: donor.id,
              organizationId,
              amount,
              date: new Date(),
              paymentMethod: 'CREDIT_CARD',
              status: 'COMPLETED',
              type: 'ONE_TIME',
              isSimulated: true
            }
          });
        }

        // Create activity feed entry
        await prisma.activityFeed.create({
          data: {
            organizationId,
            userId,
            action: activityData.action,
            title: activityData.title,
            description: activityData.description,
            amount: activityData.amount,
            donorId: donor.id,
            metadata: {
              ...activityData.metadata,
              simulationId
            },
            priority: activityData.importance === 'HIGH' ? 'HIGH' : 'NORMAL',
            isRead: false
          }
        });
      }
    }

    // Update simulation stats
    simulation.stats.activitiesGenerated += activitiesToGenerate;
    simulation.lastTickAt = new Date().toISOString();

    // Schedule next tick based on speed
    if (simulation.status === 'running') {
      const tickInterval = Math.max(1000, 10000 / speed); // speed 1 = 10s, speed 10 = 1s
      simulation.nextTickTimeout = setTimeout(
        () => runSimulationTick(simulationId, config),
        tickInterval
      );
    }
  } catch (error) {
    console.error(`Simulation tick error (${simulationId}):`, error);
    simulation.error = error.message;
  }
}

// Helper: Generate fake donor data
function generateFakeDonor(organizationId, isSimulated = true) {
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'David', 'Sarah', 'Thomas', 'Elizabeth'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
  const professions = ['Engineer', 'Doctor', 'Teacher', 'Lawyer', 'Entrepreneur', 'Architect', 'Consultant', 'Executive'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
  
  return {
    organizationId,
    firstName,
    lastName,
    email,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    preferredContact: ['EMAIL', 'PHONE', 'MAIL'][Math.floor(Math.random() * 3)],
    relationshipStage: ['NEW', 'CULTIVATION', 'ASK_READY', 'STEWARDSHIP'][Math.floor(Math.random() * 4)],
    status: Math.random() > 0.3 ? 'ACTIVE' : 'LYBUNT',
    isSimulated,
    notes: `Generated by AI system. ${firstName} is interested in our work.`,
    personalNotes: {
      interests: ['Education', 'Healthcare', 'Environment', 'Arts', 'Animals', 'Veterans']
        .filter(() => Math.random() > 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 1),
      givingCapacity: Math.floor(Math.random() * 50000) + 1000,
      lastContact: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
      communicationStyle: ['Formal', 'Casual', 'Direct', 'Conversational'][Math.floor(Math.random() * 4)],
      motivation: ['Personal connection', 'Tax benefits', 'Social impact', 'Community', 'Family legacy'][Math.floor(Math.random() * 5)]
    }
  };
}

// Helper: Generate AI response for donor
async function generateDonorResponse(donor, message, history = []) {
  if (!openai) {
    const responses = [
      "Thank you for reaching out. I appreciate your organization's work and would like to learn more about how my donation would be used.",
      "That's a great question. I've been supporting similar causes and would like to understand your specific impact metrics.",
      "I'm interested in learning about matching gift opportunities or other ways to maximize my contribution.",
      "Before making a decision, I'd like to understand your organization's long-term strategy and financial transparency.",
      "I appreciate you checking in. Could you tell me more about the specific programs my donation would support?"
    ];
    
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      sentiment: 'positive',
      suggestedAction: 'Follow up in 1 week',
      confidence: 0.8
    };
  }

  try {
    const donorNotes = donor.personalNotes || {};
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are ${donor.firstName} ${donor.lastName}, a donor with the following profile:
          
          Relationship Stage: ${donor.relationshipStage}
          Status: ${donor.status}
          Preferred Contact: ${donor.preferredContact}
          
          Personal Notes: ${JSON.stringify(donorNotes)}
          
          Previous giving: ${donorNotes.givingCapacity ? `Capacity: $${donorNotes.givingCapacity}` : 'Not specified'}
          Communication Style: ${donorNotes.communicationStyle || 'Balanced'}
          Interests: ${donorNotes.interests?.join(', ') || 'General philanthropy'}
          Motivation: ${donorNotes.motivation || 'Making a difference'}
          
          Respond as this donor would to a fundraiser. Be authentic to their personality and giving style.`
        },
        ...history.slice(-5).map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.content
        })),
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return {
      response: completion.choices[0].message.content,
      sentiment: 'positive',
      suggestedAction: 'Continue conversation',
      confidence: 0.9
    };
  } catch (error) {
    console.error('OpenAI error:', error);
    return {
      response: "I'm considering your question. Could you provide more details?",
      sentiment: 'neutral',
      suggestedAction: 'Clarify question',
      confidence: 0.6
    };
  }
}

// Helper: Generate assistant response
async function generateAssistantResponse(message, context = {}) {
  const fallbackResponses = [
    "Based on donor engagement patterns, focusing on personalized follow-ups within 48 hours often improves retention.",
    "Donors who receive a thank-you touchpoint within 24 hours tend to stay more engaged over time.",
    "Segmenting donors by giving level can help you tailor communication more effectively.",
    "Many teams see stronger relationships when they use personal, story-driven updates instead of generic asks.",
    "Consistent, thoughtful communication builds trust long before the next donation request."
  ];

  const fallback = (confidence = 0.75) => ({
    response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
    type: 'advice',
    confidence
  });

  if (!openai) {
    return fallback(0.8);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI fundraising expert. Provide concise, actionable advice for:
          
          1. Donor engagement and retention
          2. Fundraising strategy
          3. Donor communication
          4. Campaign planning
          5. Data analysis and insights
          
          Use data-driven recommendations when possible. Be practical and specific.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 250
    });

    return {
      response: completion.choices[0].message.content,
      type: 'advice',
      confidence: 0.9
    };

  } catch (error) {
    const isRateLimit =
      error?.status === 429 ||
      error?.code === 'rate_limit_exceeded' ||
      error?.message?.toLowerCase().includes('rate');

    if (isRateLimit) {
      console.warn('OpenAI rate limit hit — using fallback response');
      return fallback(0.7);
    }

    console.error('OpenAI error:', error);
    return {
      response: "I'm having trouble generating a response right now. You might find insight by reviewing recent donor interactions or engagement trends.",
      type: 'general',
      confidence: 0.6
    };
  }
}

async function generateDonorBrief({ donorId, organizationId, context }) {
  const donor = await prisma.donor.findFirst({
    where: { id: donorId, organizationId }
  });

  if (!donor) {
    throw new Error('Donor not found');
  }

  const donations = await prisma.donation.findMany({
    where: { donorId, organizationId },
    orderBy: { createdAt: 'desc' }
  });

  return {
    donor,
    stats: {
      donationCount: donations.length,
    },
    activity: [],
    aiInsights: {},
    generatedAt: new Date().toISOString()
  };
}

export async function POST(request) {
  let user = null;
  
  try {
    // Get token from cookies
    const token = cookies().get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    try {
      user = await verifyToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    const { action, method, params } = body;
    
    // Use either action or method for compatibility
    const apiMethod = action || method;
    const organizationId = user.organizationId;
    const userId = user.id;

    console.log('AI API Method:', apiMethod, 'Organization:', organizationId);

    // ============ DONOR MANAGEMENT ============
      if (apiMethod === 'generateFakeDonors' || apiMethod === 'generateFakeDonors') {
        const { 
          count = 5, 
          isSimulated = true, 
          includeDonations = true, 
          includeCommunications = false 
        } = params || {};
        
        const donors = [];
        
        for (let i = 0; i < count; i++) {
          // Generate fake donor data
          const donorData = generateFakeDonor(organizationId, isSimulated);
          
          // Create donor in database with correct schema
          const donor = await prisma.donor.create({
            data: {
              firstName: donorData.firstName,
              lastName: donorData.lastName,
              email: donorData.email,
              phone: donorData.phone,
              organizationId,
              status: donorData.status || 'ACTIVE',
              preferredContact: donorData.preferredContact || 'EMAIL',
              relationshipStage: donorData.relationshipStage || 'NEW',
              isSimulated,
              notes: donorData.notes,
              personalNotes: donorData.personalNotes || {},
              
              // Create address if we have one
              ...(donorData.address && {
                address: {
                  create: {
                    street: donorData.address.street || `${Math.floor(Math.random() * 9999)} Main St`,
                    city: donorData.address.city || ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
                    state: donorData.address.state || ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
                    zipCode: donorData.address.zipCode || `${Math.floor(Math.random() * 90000) + 10000}`,
                    country: 'USA'
                  }
                }
              })
            },
            include: {
              address: true
            }
          });
          
          donors.push(donor);
          
          // Create donor activity if we have the relation
          try {
            await prisma.donorActivity.create({
              data: {
                donorId: donor.id,
                organizationId,
                type: 'DONOR_CREATED',
                action: 'DONOR_GENERATED',
                title: 'AI Generated Donor',
                description: `Generated ${donor.firstName} ${donor.lastName} via AI system`,
                importance: 'NORMAL',
                metadata: {
                  isSimulated: true,
                  generationDate: new Date().toISOString()
                }
              }
            });
          } catch (activityError) {
            console.warn('Could not create donor activity:', activityError.message);
          }

          // Generate fake donations if requested
          if (includeDonations) {
            let totalAmount = 0;
            let donationCount = 0;
            
            const numDonations = Math.floor(Math.random() * 3) + 1; // 1-3 donations
            
            for (let j = 0; j < numDonations; j++) {
              const amount = Math.floor(Math.random() * 500) + 50; // $50-$550
              totalAmount += amount;
              donationCount++;
              
              const donation = await prisma.donation.create({
                data: {
                  donorId: donor.id,
                  organizationId,
                  amount,
                  date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
                  paymentMethod: 'CREDIT_CARD',
                  status: 'COMPLETED',
                  type: 'ONE_TIME',
                  isSimulated: true
                }
              });

              // Create donation activity
              try {
                await prisma.donorActivity.create({
                  data: {
                    donorId: donor.id,
                    organizationId,
                    type: 'DONATION',
                    action: 'DONATION_RECEIVED',
                    title: 'New Donation',
                    description: `Received $${amount} donation`,
                    amount,
                    relatedDonationId: donation.id,
                    importance: 'HIGH',
                    metadata: {
                      isSimulated: true,
                      paymentMethod: donation.paymentMethod
                    }
                  }
                });
              } catch (activityError) {
                console.warn('Could not create donation activity:', activityError.message);
              }
            }
            
            // Update donor with donation stats
            
          }

          // Generate fake communications if requested
          if (includeCommunications) {
            const numCommunications = Math.floor(Math.random() * 2) + 1; // 1-2 communications
            
            for (let j = 0; j < numCommunications; j++) {
              const communicationTypes = ['EMAIL', 'PHONE_CALL', 'MEETING', 'THANK_YOU_NOTE'];
              const type = communicationTypes[Math.floor(Math.random() * communicationTypes.length)];
              
              const communication = await prisma.communication.create({
                data: {
                  donorId: donor.id,
                  organizationId,
                  userId,
                  type,
                  direction: Math.random() > 0.5 ? 'OUTBOUND' : 'INBOUND',
                  subject: `Follow up with ${donor.firstName}`,
                  content: `Thank you for your continued support. We appreciate donors like you.`,
                  status: 'SENT',
                  sentAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                  isSimulated: true
                }
              });

              // Create communication activity
              try {
                await prisma.donorActivity.create({
                  data: {
                    donorId: donor.id,
                    organizationId,
                    type: 'COMMUNICATION',
                    action: `${type}_SENT`,
                    title: `${type.replace('_', ' ')} Sent`,
                    description: `Sent ${type.toLowerCase()} to ${donor.firstName}`,
                    relatedCommunicationId: communication.id,
                    importance: 'NORMAL',
                    metadata: {
                      isSimulated: true,
                      communicationType: type,
                      direction: communication.direction
                    }
                  }
                });
              } catch (activityError) {
                console.warn('Could not create communication activity:', activityError.message);
              }
            }
          }
        }

        // Create activity feed entry
        try {
          await prisma.activityFeed.create({
            data: {
              organizationId,
              userId,
              action: 'DONORS_GENERATED',
              title: 'AI Generated Donors',
              description: `Generated ${count} fake donor${count > 1 ? 's' : ''}`,
              amount: count,
              metadata: { 
                count, 
                simulated: isSimulated,
                donations: includeDonations,
                communications: includeCommunications,
                donorIds: donors.map(d => d.id)
              },
              priority: 'NORMAL',
              isRead: false
            }
          });
        } catch (feedError) {
          console.warn('Could not create activity feed:', feedError.message);
        }

        return NextResponse.json({
          success: true,
          data: { donors },
          count: donors.length,
          message: `Successfully generated ${donors.length} donors`
        });
      }

    // Rest of your switch statement...
    switch (apiMethod) {
      // ============ CHAT METHODS ============
      case 'sendMessage': {
        const { message, context } = params;
        const response = await generateAssistantResponse(message, context);
        
        await prisma.activityFeed.create({
          data: {
            organizationId,
            userId,
            action: 'AI_CONSULTATION',
            title: 'AI Chat Consultation',
            description: `User asked: "${message.substring(0, 100)}..."`,
            metadata: { message, response },
            priority: 'NORMAL'
          }
        });

        return NextResponse.json({
          success: true,
          data: response
        });
      }

      case 'generateBrief': {
        const { donorId, orgId, context } = params;

        if (!donorId || !orgId) {
          return NextResponse.json(
            { success: false, error: 'Missing donorId or orgId' },
            { status: 400 }
          );
        }

        const brief = await generateDonorBrief({
          donorId,
          organizationId: orgId,
          context,
        });

        return NextResponse.json({
          success: true,
          data: brief
        });
      }

      case 'chatWithDonor': {
        const { donorId, message } = params;
        
        const donor = await prisma.donor.findFirst({
          where: { id: donorId, organizationId }
        });

        if (!donor) {
          return NextResponse.json({ success: false, error: 'Donor not found' }, { status: 404 });
        }

        const history = await prisma.communication.findMany({
          where: { donorId, organizationId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { content: true, direction: true, createdAt: true }
        });

        const response = await generateDonorResponse(donor, message, history);

        await prisma.communication.create({
          data: {
            organizationId,
            donorId,
            type: 'EMAIL',
            direction: 'OUTBOUND',
            subject: 'AI Chat Conversation',
            content: `User: ${message}\n\nAI (as ${donor.firstName}): ${response.response}`,
            status: 'SENT',
            sentAt: new Date(),
            userId
          }
        });

        return NextResponse.json({
          success: true,
          data: {
            response: response.response,
            donor: {
              id: donor.id,
              name: `${donor.firstName} ${donor.lastName}`,
              relationshipStage: donor.relationshipStage
            },
            ...response
          }
        });
      }

      case 'organizationActivity': {
        const { limit = 25 } = params || {};

        if (!organizationId) {
          return NextResponse.json(
            { success: false, error: 'No organization ID' },
            { status: 400 }
          );
        }

        const activities = await prisma.activityFeed.findMany({
          where: { organizationId },
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            donation: {
              select: {
                id: true,
                amount: true,
                date: true
              }
            }
          }
        });

        return NextResponse.json({
          success: true,
          data: activities,
          count: activities.length
        });
      }

      case 'generateDonation': {
        const { donorId, amount = null, campaign = 'General Fund' } = params;
        
        const donor = await prisma.donor.findFirst({
          where: { id: donorId, organizationId }
        });

        if (!donor) {
          return NextResponse.json({ success: false, error: 'Donor not found' }, { status: 404 });
        }

        const donationAmount = amount || Math.floor(Math.random() * 5000) + 100;
        const paymentMethods = ['CREDIT_CARD', 'BANK_TRANSFER', 'CHECK'];

        const campaignRecord = await prisma.campaign.upsert({
          where: {
            organizationId_name: {
              organizationId,
              name: campaign
            }
          },
          update: {},
          create: {
            organizationId,
            name: campaign,
            status: 'ACTIVE'
          }
        });

        const donation = await prisma.donation.create({
          data: {
            organizationId,
            donorId,
            amount: donationAmount,
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            date: new Date(),
            type: 'ONE_TIME',
            status: 'COMPLETED',
            campaignId: campaignRecord.id
          }
        });

        // Update donor stats
   
   
      }

      case 'deleteDonor': {
        const { donorId } = params;
        
        const donor = await prisma.donor.findFirst({
          where: { id: donorId, organizationId }
        });

        if (!donor) {
          return NextResponse.json({ success: false, error: 'Donor not found' }, { status: 404 });
        }

        const wasSimulated = donor.isSimulated;
        
        await prisma.donor.delete({
          where: { id: donorId }
        });

        return NextResponse.json({
          success: true,
          data: { wasSimulated }
        });
      }

      case 'getDonors': {
        const { limit = 50, filters = {} } = params;
        
        const donors = await prisma.donor.findMany({
          where: { 
            organizationId,
            ...filters
          },
          include: {
            donations: {
              take: 5,
              orderBy: { date: 'desc' }
            },
            communications: {
              take: 3,
              orderBy: { sentAt: 'desc' }
            }
          },
          take: limit,
          orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({
          success: true,
          data: donors,
          count: donors.length
        });
      }

      case 'getDonorDetails': {
        const { donorId } = params;
        
        const donor = await prisma.donor.findFirst({
          where: { id: donorId, organizationId },
          include: {
            donations: {
              orderBy: { date: 'desc' },
              include: { campaign: true }
            },
            communications: {
              orderBy: { sentAt: 'desc' },
              take: 10
            }
          }
        });

        if (!donor) {
          return NextResponse.json({ success: false, error: 'Donor not found' }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          data: donor
        });
      }

      case 'getRecentActivities': {
        const { limit = 20 } = params;
        
        const activities = await prisma.activityFeed.findMany({
          where: { organizationId },
          include: {
            donor: {
              select: { id: true, firstName: true, lastName: true }
            },
            user: {
              select: { id: true, name: true }
            },
            donation: {
              select: { id: true, amount: true }
            }
          },
          take: limit,
          orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
          success: true,
          data: activities
        });
      }

      case 'getRecommendations': {
        const lapsedDonors = await prisma.donor.findMany({
          where: {
            organizationId,
            status: 'LYBUNT',
            donations: {
              none: {
                date: {
                  gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
                }
              }
            }
          },
          take: 5,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            donations: {
              select: {
                date: true,
                amount: true
              },
              orderBy: { date: 'desc' },
              take: 1
            }
          }
        });

        const recommendations = lapsedDonors.map(donor => ({
          id: `rec_${donor.id}`,
          type: 're-engagement',
          priority: 'high',
          title: `Re-engage ${donor.firstName} ${donor.lastName}`,
          description: 'Hasn\'t given in over a year',
          action: 'Send personalized re-engagement email',
          expectedImpact: '15% reactivation rate',
          donor: donor
        }));

        return NextResponse.json({
          success: true,
          data: recommendations
        });
      }


        // In your POST function, replace the simulation cases:

          case 'startSimulationFlow':
          case 'startSimulation': {
            const { 
              donorLimit = 50, 
              speed = 5, 
              activityTypes = [
                { type: 'DONATION', enabled: true },
                { type: 'COMMUNICATION', enabled: true },
                { type: 'MEETING', enabled: true },
                { type: 'TASK', enabled: false }
              ],
              realism = 0.7,
              organizationId: paramOrgId
            } = params || {};

            // Use organizationId from token or from params
            const targetOrgId = organizationId || paramOrgId;
            
            if (!targetOrgId) {
              return NextResponse.json({
                success: false,
                error: 'Organization ID is required'
              }, { status: 400 });
            }

            // Generate simulation ID
            const simulationId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Check if there's already a running simulation
            let existingSimulation = null;
            for (const [id, sim] of activeSimulations.entries()) {
              if (sim.organizationId === targetOrgId && sim.status === 'running') {
                existingSimulation = id;
                break;
              }
            }

            if (existingSimulation) {
              // Stop existing simulation
              const oldSim = activeSimulations.get(existingSimulation);
              if (oldSim.nextTickTimeout) {
                clearTimeout(oldSim.nextTickTimeout);
              }
              oldSim.status = 'stopped';
            }

            // Create new simulation config
            const simulationConfig = {
              organizationId: targetOrgId,
              userId,
              donorLimit,
              speed: Math.min(Math.max(speed, 1), 10), // Clamp between 1-10
              activityTypes,
              realism: Math.min(Math.max(realism, 0.1), 1) // Clamp between 0.1-1
            };

            // Initialize simulation state
            activeSimulations.set(simulationId, {
              id: simulationId,
              organizationId: targetOrgId,
              status: 'running',
              startedAt: new Date().toISOString(),
              lastTickAt: null,
              donors: [],
              config: simulationConfig,
              stats: {
                activitiesGenerated: 0,
                donationsGenerated: 0,
                donorsCreated: 0
              },
              nextTickTimeout: null
            });

            // Start first tick
            runSimulationTick(simulationId, simulationConfig);

            // Log simulation start in activity feed
            await prisma.activityFeed.create({
              data: {
                organizationId: targetOrgId,
                userId,
                action: 'SIMULATION_STARTED',
                title: 'Simulation Started',
                description: `Started simulation with ${donorLimit} donors, speed ${speed}x`,
                metadata: {
                  simulationId,
                  config: simulationConfig,
                  timestamp: new Date().toISOString()
                },
                priority: 'HIGH',
                isRead: false
              }
            });

            return NextResponse.json({
              success: true,
              data: {
                simulationId,
                status: 'running',
                config: simulationConfig,
                message: 'Simulation started successfully'
              }
            });
          }

          case 'stopSimulation':
          case 'stopSimulationFlow': {
            const { simulationId } = params || {};
            
            // If no specific simulation ID, stop all for this organization
            let stoppedCount = 0;
            
            for (const [id, sim] of activeSimulations.entries()) {
              if (sim.organizationId === organizationId && (!simulationId || id === simulationId)) {
                if (sim.nextTickTimeout) {
                  clearTimeout(sim.nextTickTimeout);
                }
                sim.status = 'stopped';
                activeSimulations.delete(id);
                stoppedCount++;
                
                // Log simulation stop
                await prisma.activityFeed.create({
                  data: {
                    organizationId,
                    userId,
                    action: 'SIMULATION_STOPPED',
                    title: 'Simulation Stopped',
                    description: `Simulation ${id} stopped`,
                    metadata: {
                      simulationId: id,
                      timestamp: new Date().toISOString(),
                      stats: sim.stats
                    },
                    priority: 'NORMAL',
                    isRead: false
                  }
                });
              }
            }

            return NextResponse.json({
              success: true,
              data: {
                stoppedCount,
                message: stoppedCount > 0 
                  ? `Stopped ${stoppedCount} simulation${stoppedCount > 1 ? 's' : ''}` 
                  : 'No running simulations found'
              }
            });
          }

          case 'getSimulationStatus': {
            const { simulationId } = params || {};
            
            const simulations = [];
            
            for (const [id, sim] of activeSimulations.entries()) {
              if (sim.organizationId === organizationId && (!simulationId || id === simulationId)) {
                simulations.push({
                  id,
                  status: sim.status,
                  startedAt: sim.startedAt,
                  lastTickAt: sim.lastTickAt,
                  donorCount: sim.donors?.length || 0,
                  config: sim.config,
                  stats: sim.stats,
                  error: sim.error
                });
              }
            }

            return NextResponse.json({
              success: true,
              data: {
                simulations,
                count: simulations.length
              }
            });
          }

              


            default:
              return NextResponse.json({
                success: false,
                error: `Unknown method: ${apiMethod}`
              }, { status: 400 });
          }
        } catch (error) {
          console.error('API Error:', error);
          return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
          }, { status: 500 });
        }
      }



export async function GET(request) {
  try {
    const token = cookies().get('auth_token')?.value;
    
    let user = null;
    if (token) {
      try {
        user = await verifyToken(token);
      } catch (error) {
        console.error('Token verification error:', error);
      }
    }

    const url = new URL(request.url);
    const method = url.searchParams.get('method');
    
    if (method === 'health') {
      return NextResponse.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          authenticated: !!user
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: `GET not supported for method: ${method}. Use POST instead.`
    }, { status: 405 });
  } catch (error) {
    console.error('GET API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}